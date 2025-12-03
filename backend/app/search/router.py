from fastapi import APIRouter
import yt_dlp

router = APIRouter(prefix="/search", tags=["search"])


def _build_ydl():
    return yt_dlp.YoutubeDL(
        {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": True,
            "skip_download": True,
        }
    )


@router.get("/")
def search(q: str):
    with _build_ydl() as ydl:
        result = ydl.extract_info(f"ytsearch20:{q}", download=False)
        tracks: list[dict] = []
        for entry in result.get("entries", []):
            if not entry:
                continue
            tracks.append(
                {
                    "source": "YOUTUBE",
                    "source_id": entry.get("id"),
                    "title": entry.get("title"),
                    "artist": entry.get("uploader") or entry.get("channel"),
                    "duration_sec": entry.get("duration"),
                    "cover_url": entry.get("thumbnail"),
                    "audio_url": None,
                }
            )
        return tracks
