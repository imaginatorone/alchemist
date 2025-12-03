from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, joinedload

from app.auth.utils import get_current_user, get_db
from app.models import Track, User, UserTrack
from app.schemas import AddToLibraryIn, UserTrackOut

router = APIRouter(prefix="/library", tags=["library"])


@router.get("/tracks", response_model=list[UserTrackOut])
def get_my_tracks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(UserTrack)
        .options(joinedload(UserTrack.track))
        .filter(UserTrack.user_id == user.id)
        .order_by(UserTrack.created_at.desc())
        .all()
    )


@router.post("/tracks", response_model=UserTrackOut, status_code=status.HTTP_201_CREATED)
def add_track(
    payload: AddToLibraryIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    track = (
        db.query(Track)
        .filter(
            Track.source == payload.source,
            Track.source_id == payload.source_id,
        )
        .first()
    )

    if not track:
        track = Track(**payload.dict())
        db.add(track)
        db.commit()
        db.refresh(track)
    elif payload.audio_url and not track.audio_url:
        track.audio_url = payload.audio_url
        db.commit()
        db.refresh(track)

    existing = (
        db.query(UserTrack)
        .filter(
            UserTrack.user_id == user.id,
            UserTrack.track_id == track.id,
        )
        .first()
    )

    if existing:
        return existing

    user_track = UserTrack(user_id=user.id, track_id=track.id)
    db.add(user_track)
    db.commit()
    db.refresh(user_track)
    return user_track
