from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlmodel import Session, select
import jwt

from db import get_session
from models import User

# ponytail: hardcoded dev secret, fine for localhost demo; move to env for real
SECRET = "dev-globetrotter-secret-change-me"
ALGO = "HS256"
TOKEN_DAYS = 7

pwd = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_pw(raw: str) -> str:
    return pwd.hash(raw)


def verify_pw(raw: str, hashed: str) -> bool:
    return pwd.verify(raw, hashed)


def make_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET, algorithm=ALGO)


def current_user(token: str = Depends(oauth2), session: Session = Depends(get_session)) -> User:
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
