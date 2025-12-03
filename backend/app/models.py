from datetime import datetime
import uuid

from datetime import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    library = relationship("UserTrack", back_populates="user", cascade="all, delete")


class LoginCode(Base):
    __tablename__ = "login_codes"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    email = Column(String, index=True, nullable=False)
    code_hash = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class Track(Base):
    __tablename__ = "tracks"
    id = Column(String, primary_key=True, default=gen_uuid)
    source = Column(String, index=True, nullable=False)
    source_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=True)
    duration_sec = Column(Integer, nullable=True)
    cover_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("source", "source_id", name="uq_source_id"),)
    user_tracks = relationship("UserTrack", back_populates="track", cascade="all, delete")


class UserTrack(Base):
    __tablename__ = "user_tracks"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    track_id = Column(String, ForeignKey("tracks.id"), nullable=False)
    liked = Column(Boolean, default=True)
    play_count = Column(Integer, default=0)
    offline_available = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="library")
    track = relationship("Track", back_populates="user_tracks")
