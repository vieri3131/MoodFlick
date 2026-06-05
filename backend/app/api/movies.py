from fastapi import APIRouter, Query
from app.services.tmdb_service import discover_movies, search_movies

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