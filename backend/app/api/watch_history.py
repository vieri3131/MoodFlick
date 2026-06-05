from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from postgrest.exceptions import APIError
from app.api.auth import supabase, get_user_id_from_token

router = APIRouter(tags=["watch_history"])


class WatchHistoryItem(BaseModel):
    movie_id: int
    movie_title: str
    poster_path: str


def _get_user_id(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.removeprefix("Bearer ") if hasattr(authorization, 'removeprefix') else authorization[len("Bearer "):]
    return get_user_id_from_token(token)


@router.post("/watch-history", status_code=201)
def add_to_watch_history(item: WatchHistoryItem, authorization: str | None = Header(default=None)):
    user_id = _get_user_id(authorization)
    try:
        supabase.table("watch_history").insert({
            "user_id": user_id,
            "movie_id": item.movie_id,
            "movie_title": item.movie_title,
            "poster_path": item.poster_path
        }).execute()
        return {"message": "Added to watch history"}
    except APIError as e:
        if "23505" in str(e):
            raise HTTPException(status_code=409, detail="Already in watch history")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/watch-history/{movie_id}")
def remove_from_watch_history(movie_id: int, authorization: str | None = Header(default=None)):
    user_id = _get_user_id(authorization)
    try:
        result = supabase.table("watch_history").delete().eq(
            "user_id", user_id
        ).eq("movie_id", movie_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Not found in watch history")
        return {"message": "Removed from watch history"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/watch-history")
def get_watch_history(authorization: str | None = Header(default=None)):
    user_id = _get_user_id(authorization)
    try:
        result = supabase.table("watch_history").select("*").eq(
            "user_id", user_id
        ).order("watched_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
