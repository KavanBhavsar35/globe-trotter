import secrets
from datetime import date, datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select
from botocore.exceptions import BotoCoreError, ClientError

from db import init_db, get_session, engine
from models import User, Trip, City, Activity, Stop, StopActivity, PasswordReset
from auth import hash_pw, verify_pw, make_token, current_user
from seed_data import seed_catalog
from core.config import settings
from services.email_service import EmailService
from services.storage_service import StorageService

app = FastAPI(title="GlobeTrotter API")
email_service = EmailService()
storage = StorageService()

MAX_PHOTO_BYTES = 5 * 1024 * 1024  # 5 MB

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    init_db()
    with Session(engine) as s:
        seed_catalog(s)


# ---------- schemas ----------
class Credentials(BaseModel):
    email: str
    password: str


class SignupIn(BaseModel):
    email: str
    password: str
    first_name: str = ""
    last_name: str = ""
    phone: str = ""
    city: str = ""
    country: str = ""
    bio: str = ""


class TripIn(BaseModel):
    name: str
    country: str = ""
    start_date: date
    end_date: date
    description: str = ""


class StopIn(BaseModel):
    city_id: int
    start_date: date
    end_date: date


class ActivityIn(BaseModel):
    activity_id: int


class ForgotIn(BaseModel):
    email: str


class ResetIn(BaseModel):
    token: str
    password: str


# ---------- helpers ----------
def _nights(start: date, end: date) -> int:
    return max((end - start).days, 1)


def build_itinerary(trip: Trip, session: Session) -> dict:
    stops = session.exec(
        select(Stop).where(Stop.trip_id == trip.id).order_by(Stop.order, Stop.start_date)
    ).all()
    cat = {"stay": 0, "meals": 0, "transport": 0, "activities": 0}
    total_nights = 0
    out_stops = []
    for st in stops:
        city = session.get(City, st.city_id)
        nights = _nights(st.start_date, st.end_date)
        total_nights += nights
        links = session.exec(select(StopActivity).where(StopActivity.stop_id == st.id)).all()
        acts, act_cost = [], 0
        for link in links:
            a = session.get(Activity, link.activity_id)
            if not a:
                continue
            act_cost += a.cost
            acts.append({
                "stop_activity_id": link.id, "activity_id": a.id, "name": a.name,
                "type": a.type, "cost": a.cost, "duration_hours": a.duration_hours,
            })
        stay = nights * city.cost_index
        meals = nights * 30
        transport = 100
        cat["stay"] += stay
        cat["meals"] += meals
        cat["transport"] += transport
        cat["activities"] += act_cost
        out_stops.append({
            "stop_id": st.id, "city": {"id": city.id, "name": city.name, "country": city.country},
            "start_date": st.start_date, "end_date": st.end_date, "nights": nights,
            "activities": acts, "subtotal": stay + meals + transport + act_cost,
        })
    total = sum(cat.values())
    # ponytail: naive heuristic (flat meals/transport); swap for real rates only if asked
    budget = {
        "total": total, "categories": cat,
        "per_day_avg": round(total / total_nights) if total_nights else 0,
    }
    return {"trip": trip, "stops": out_stops, "budget": budget}


def owned_trip(trip_id: int, session: Session, user: User) -> Trip:
    trip = session.get(Trip, trip_id)
    if not trip or trip.user_id != user.id:
        raise HTTPException(404, "Trip not found")
    return trip


def _photo_url(user: User) -> str:
    # Files are private; hand back a short-lived presigned GET URL for rendering.
    if not user.photo_key:
        return ""
    return storage.generate_presigned_download_url(user.photo_key)


# ---------- auth ----------
@app.get("/health")
def health():
    return {"ok": True}


@app.post("/auth/signup")
def signup(body: SignupIn, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.email == body.email)).first():
        raise HTTPException(400, "Email already registered")
    data = body.model_dump(exclude={"password"})
    user = User(**data, pw_hash=hash_pw(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"token": make_token(user.id), "email": user.email}


@app.post("/auth/login")
def login(body: Credentials, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == body.email)).first()
    if not user or not verify_pw(body.password, user.pw_hash):
        raise HTTPException(401, "Invalid email or password")
    return {"token": make_token(user.id), "email": user.email}


@app.get("/auth/me")
def me(user: User = Depends(current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "city": user.city,
        "country": user.country,
        "bio": user.bio,
        "photo_url": _photo_url(user),
    }


@app.post("/auth/me/photo")
async def upload_photo(
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    session: Session = Depends(get_session),
):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "File must be an image")
    data = await file.read()
    if len(data) > MAX_PHOTO_BYTES:
        raise HTTPException(400, "Image too large (max 5 MB)")
    old_key = user.photo_key
    try:
        key = storage.upload_file(
            data, file.filename or "photo.jpg", file.content_type, folder="profiles"
        )
        if old_key:
            storage.delete_file(old_key)  # drop the replaced blob
    except (BotoCoreError, ClientError):
        raise HTTPException(502, "Storage unavailable")
    user.photo_key = key
    session.add(user)
    session.commit()
    return {"photo_url": _photo_url(user)}


@app.post("/auth/forgot-password")
def forgot_password(body: ForgotIn, session: Session = Depends(get_session)):
    # Always return the same response — never reveal whether an email is registered.
    user = session.exec(select(User).where(User.email == body.email)).first()
    if user:
        # Invalidate any prior tokens for this user, then issue a fresh one.
        for old in session.exec(select(PasswordReset).where(PasswordReset.user_id == user.id)).all():
            session.delete(old)
        token = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_TOKEN_MINUTES)
        session.add(PasswordReset(user_id=user.id, token=token, expires_at=expires))
        session.commit()
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        email_service.send_password_reset_email(user.email, token, reset_url=reset_url)
    return {"ok": True, "message": "If that email is registered, a reset link has been sent."}


@app.post("/auth/reset-password")
def reset_password(body: ResetIn, session: Session = Depends(get_session)):
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    pr = session.exec(select(PasswordReset).where(PasswordReset.token == body.token)).first()
    if not pr:
        raise HTTPException(400, "Invalid or expired reset link")
    expires = pr.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)  # SQLite drops tz on round-trip
    if expires < datetime.now(timezone.utc):
        session.delete(pr)
        session.commit()
        raise HTTPException(400, "Invalid or expired reset link")
    user = session.get(User, pr.user_id)
    if not user:
        raise HTTPException(400, "Invalid or expired reset link")
    user.pw_hash = hash_pw(body.password)
    session.add(user)
    session.delete(pr)  # single-use token
    session.commit()
    return {"ok": True}


# ---------- trips ----------
@app.get("/trips")
def list_trips(user: User = Depends(current_user), session: Session = Depends(get_session)):
    trips = session.exec(select(Trip).where(Trip.user_id == user.id)).all()
    out = []
    for t in trips:
        stops = session.exec(select(Stop).where(Stop.trip_id == t.id)).all()
        out.append({**t.model_dump(), "stop_count": len(stops)})
    return out


@app.post("/trips")
def create_trip(body: TripIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    trip = Trip(user_id=user.id, **body.model_dump())
    session.add(trip)
    session.commit()
    session.refresh(trip)
    return trip


@app.get("/trips/{trip_id}/itinerary")
def get_itinerary(trip_id: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    trip = owned_trip(trip_id, session, user)
    return build_itinerary(trip, session)


@app.delete("/trips/{trip_id}")
def delete_trip(trip_id: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    trip = owned_trip(trip_id, session, user)
    for st in session.exec(select(Stop).where(Stop.trip_id == trip.id)).all():
        for link in session.exec(select(StopActivity).where(StopActivity.stop_id == st.id)).all():
            session.delete(link)
        session.delete(st)
    session.delete(trip)
    session.commit()
    return {"ok": True}


@app.post("/trips/{trip_id}/share")
def share_trip(trip_id: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    trip = owned_trip(trip_id, session, user)
    if not trip.share_token:
        trip.share_token = secrets.token_urlsafe(8)
    trip.is_public = True
    session.add(trip)
    session.commit()
    session.refresh(trip)
    return {"share_token": trip.share_token, "is_public": trip.is_public}


# ---------- stops & activities ----------
@app.post("/trips/{trip_id}/stops")
def add_stop(trip_id: int, body: StopIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    trip = owned_trip(trip_id, session, user)
    if not session.get(City, body.city_id):
        raise HTTPException(404, "City not found")
    n = len(session.exec(select(Stop).where(Stop.trip_id == trip.id)).all())
    stop = Stop(trip_id=trip.id, city_id=body.city_id, start_date=body.start_date,
                end_date=body.end_date, order=n)
    session.add(stop)
    session.commit()
    session.refresh(stop)
    return stop


@app.delete("/stops/{stop_id}")
def delete_stop(stop_id: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    stop = session.get(Stop, stop_id)
    if not stop:
        raise HTTPException(404, "Stop not found")
    owned_trip(stop.trip_id, session, user)
    for link in session.exec(select(StopActivity).where(StopActivity.stop_id == stop.id)).all():
        session.delete(link)
    session.delete(stop)
    session.commit()
    return {"ok": True}


@app.post("/stops/{stop_id}/activities")
def add_activity(stop_id: int, body: ActivityIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    stop = session.get(Stop, stop_id)
    if not stop:
        raise HTTPException(404, "Stop not found")
    owned_trip(stop.trip_id, session, user)
    if not session.get(Activity, body.activity_id):
        raise HTTPException(404, "Activity not found")
    link = StopActivity(stop_id=stop_id, activity_id=body.activity_id)
    session.add(link)
    session.commit()
    session.refresh(link)
    return link


@app.delete("/stop-activities/{link_id}")
def remove_activity(link_id: int, user: User = Depends(current_user), session: Session = Depends(get_session)):
    link = session.get(StopActivity, link_id)
    if not link:
        raise HTTPException(404, "Not found")
    stop = session.get(Stop, link.stop_id)
    owned_trip(stop.trip_id, session, user)
    session.delete(link)
    session.commit()
    return {"ok": True}


# ---------- catalog ----------
@app.get("/countries")
def list_countries(session: Session = Depends(get_session)):
    return session.exec(select(City.country).distinct().order_by(City.country)).all()


@app.get("/cities")
def search_cities(q: str = "", country: str = "", session: Session = Depends(get_session)):
    stmt = select(City)
    if country:
        stmt = stmt.where(City.country == country)
    if q:
        stmt = stmt.where(City.name.ilike(f"%{q}%") | City.country.ilike(f"%{q}%"))
    return session.exec(stmt.order_by(City.name)).all()


@app.get("/cities/{city_id}/activities")
def city_activities(city_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Activity).where(Activity.city_id == city_id)).all()


# ---------- public read-only ----------
@app.get("/public/{token}")
def public_itinerary(token: str, session: Session = Depends(get_session)):
    trip = session.exec(select(Trip).where(Trip.share_token == token, Trip.is_public == True)).first()
    if not trip:
        raise HTTPException(404, "Public trip not found")
    return build_itinerary(trip, session)
