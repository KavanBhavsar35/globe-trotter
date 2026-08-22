from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    pw_hash: str
    # profile (registration screen) — all optional so email+password alone still works
    first_name: str = ""
    last_name: str = ""
    phone: str = ""
    city: str = ""
    country: str = ""
    bio: str = ""  # "Additional Information"
    photo_key: str = ""  # object-storage key for profile photo (see StorageService)


class PasswordReset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    token: str = Field(index=True, unique=True)
    expires_at: datetime


class Trip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    name: str
    country: str = ""  # trip is scoped to one country's catalog
    start_date: date
    end_date: date
    description: str = ""
    is_public: bool = False
    share_token: Optional[str] = Field(default=None, index=True, unique=True)


class City(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    country: str
    cost_index: int  # rough daily stay cost in USD


class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    city_id: int = Field(index=True, foreign_key="city.id")
    name: str
    type: str  # sightseeing | food | adventure | culture | relax
    cost: int
    duration_hours: int


class Stop(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trip_id: int = Field(index=True, foreign_key="trip.id")
    city_id: int = Field(foreign_key="city.id")
    start_date: date
    end_date: date
    order: int = 0


class StopActivity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    stop_id: int = Field(index=True, foreign_key="stop.id")
    activity_id: int = Field(foreign_key="activity.id")
