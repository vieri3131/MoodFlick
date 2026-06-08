from fastapi import APIRouter, Query
from app.services.tmdb_service import discover_movies, search_movies, get_movie_by_id
from app.services.tmdb_service import get_movie_trailer

router = APIRouter(tags=["recommend"])


@router.get("/movies")
def get_movies(
    genre_id: int | None = Query(default=None),
    country: str | None = Query(default=None),
    language: str = Query(default="ko-KR"),
    min_rating: float = Query(default=6.5),
):
    movies = discover_movies(
        genre_id=genre_id,
        country=country,
        language=language,
        min_rating=min_rating,
    )

    return {
        "count": len(movies),
        "movies": movies
    }


@router.get("/movies/search")
def search_movies_endpoint(
    query: str = Query(..., min_length=1),
    language: str = Query(default="ko-KR"),
):
    movies = search_movies(query=query, language=language)
    return {
        "count": len(movies),
        "movies": movies
    }


@router.get("/movies/{movie_id}")
def get_movie_detail(
    movie_id: int,
    language: str = Query(default="ko-KR"),
):
    from fastapi import HTTPException
    movie = get_movie_by_id(movie_id=movie_id, language=language)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.get("/{movie_id}/trailer")
async def fetch_movie_trailer(movie_id: int, language: str = "ko-KR"):
    trailer_key = await get_movie_trailer(movie_id, language)
    if trailer_key:
        return {"trailer_url": f"https://www.youtube.com/embed/{trailer_key}"}
    return {"trailer_url": None}