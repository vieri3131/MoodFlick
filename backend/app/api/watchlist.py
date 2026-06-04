from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from postgrest.exceptions import APIError
from app.api.auth import supabase

router = APIRouter(tags=["watchlist"])


class WatchlistItem(BaseModel):
    movie_id: int
    movie_title: str
    poster_path: str


def _get_user_id(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.removeprefix("Bearer ")
    try:
        result = supabase.auth.get_user(token)
        return result.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/watchlist", status_code=201)
def add_to_watchlist(item: WatchlistItem, authorization: str | None = Header(default=None)):
    user_id = _get_user_id(authorization)
    try:
        supabase.table("watchlist").insert({
            "user_id": user_id,
            "movie_id": item.movie_id,
            "movie_title": item.movie_title,
            "poster_path": item.poster_path
        }).execute()
        return {"message": "Added to watchlist"}
    except APIError as e:
        if "23505" in str(e):
            raise HTTPException(status_code=409, detail="Already in watchlist")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/watchlist/{movie_id}")
def remove_from_watchlist(movie_id: int, authorization: str | None = Header(default=None)):
    user_id = _get_user_id(authorization)
    try:
        result = supabase.table("watchlist").delete().eq(
            "user_id", user_id
        ).eq("movie_id", movie_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Not found in watchlist")
        return {"message": "Removed from watchlist"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/watchlist")
def get_watchlist(authorization: str | None = Header(default=None)):
    user_id = _get_user_id(authorization)
    try:
        result = supabase.table("watchlist").select("*").eq(
            "user_id", user_id
        ).order("added_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
