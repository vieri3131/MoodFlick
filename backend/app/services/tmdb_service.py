import os
import requests
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = os.getenv("TMDB_BASE_URL", "https://api.themoviedb.org/3")
TMDB_IMAGE_BASE_URL = os.getenv("TMDB_IMAGE_BASE_URL", "https://image.tmdb.org/t/p/w500")


def discover_movies(
    genre_id: int | None = None,
    genre_ids: list[int] | None = None,
    country: str | None = None,
    language: str = "ko-KR",
    min_rating: float = 6.5,
    page: int = 1,
):
    """
    TMDB Discover API를 사용해 조건에 맞는 영화 목록을 조회한다.
    """

    if not TMDB_API_KEY:
        raise RuntimeError("TMDB_API_KEY가 설정되어 있지 않습니다.")

    url = f"{TMDB_BASE_URL}/discover/movie"

    params = {
        "api_key": TMDB_API_KEY,
        "language": language,
        "sort_by": "vote_average.desc",
        "vote_count.gte": 50,
        "vote_average.gte": min_rating,
        "page": page,
    }

    if genre_ids:
        params["with_genres"] = ",".join(str(id) for id in genre_ids)
    elif genre_id:
        params["with_genres"] = genre_id

    if country and country.upper() != "ALL":
        params["with_origin_country"] = country

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()
    movies = data.get("results", [])

    return [format_movie(movie) for movie in movies]


def search_movies(query: str, language: str = "ko-KR"):
    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
        "language": language,
        "include_adult": False,
        "page": 1,
    }
    response = requests.get(f"{TMDB_BASE_URL}/search/movie", params=params)
    response.raise_for_status()
    results = response.json().get("results", [])
    return [format_movie(m) for m in results if m.get("poster_path")]


def format_movie(movie: dict):
    """
    TMDB 응답 데이터를 프론트엔드에서 사용하기 쉬운 형태로 변환한다.
    """
    poster_path = movie.get("poster_path")
    backdrop_path = movie.get("backdrop_path") # 👈 추가됨

    return {
        "tmdbId": movie.get("id"),
        "title": movie.get("title"),
        "originalTitle": movie.get("original_title"),
        "overview": movie.get("overview"),
        "posterUrl": f"{TMDB_IMAGE_BASE_URL}{poster_path}" if poster_path else None,
        # 👇 추가됨: 모달 배경용 고화질 원본 이미지
        "backdropUrl": f"https://image.tmdb.org/t/p/original{backdrop_path}" if backdrop_path else None, 
        "rating": movie.get("vote_average"),
        "releaseDate": movie.get("release_date"),
    }
