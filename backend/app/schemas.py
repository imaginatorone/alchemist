from datetime import datetime
from pydantic import BaseModel, EmailStr


class RequestCodeIn(BaseModel):
    email: EmailStr


class VerifyCodeIn(RequestCodeIn):
    code: str


class RequestCodeOut(BaseModel):
    detail: str
    debug_code: str | None = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TrackBase(BaseModel):
    source: str
    source_id: str
    title: str
    artist: str | None = None
    duration_sec: int | None = None
    cover_url: str | None = None
    audio_url: str | None = None


class AddToLibraryIn(TrackBase):
    pass


class TrackOut(TrackBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserTrackOut(BaseModel):
    id: str
    track: TrackOut
    liked: bool
    play_count: int
    offline_available: bool
    created_at: datetime

    class Config:
        from_attributes = True
