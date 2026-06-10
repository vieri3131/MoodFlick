import os
import random
import requests
import httpx
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
    if not TMDB_API_KEY:
        raise RuntimeError("TMDB_API_KEY가 설정되어 있지 않습니다.")

    url = f"{TMDB_BASE_URL}/discover/movie"

    sort_orders = [
        "vote_average.desc",
        "popularity.desc",
        "vote_count.desc",
        "primary_release_date.desc",
    ]

    base_params = {
        "api_key": TMDB_API_KEY,
        "language": language,
        "include_adult": False,
        "certification_country": "US",
        "certification.lte": "R",
        "vote_count.gte": 50,
        "vote_average.gte": min_rating,
    }

    if genre_ids:
        base_params["with_genres"] = ",".join(str(id) for id in genre_ids)
    elif genre_id:
        base_params["with_genres"] = genre_id

    if country and country.upper() != "ALL" and "," not in country:
        base_params["with_origin_country"] = country

    all_movies = []
    seen_ids = set()

    for sort_by in sort_orders:
        try:
            params = {**base_params, "sort_by": sort_by, "page": random.randint(1, 3)}
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            results = response.json().get("results", [])
            for movie in results:
                mid = movie.get("id")
                if mid and mid not in seen_ids:
                    seen_ids.add(mid)
                    all_movies.append(format_movie(movie))
        except Exception:
            continue

    random.shuffle(all_movies)
    return all_movies


def search_movies(query: str, language: str = "ko-KR"):
    if not TMDB_API_KEY:
        raise RuntimeError("TMDB_API_KEY가 설정되어 있지 않습니다.")

    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
        "language": language,
        "include_adult": False,
        "page": 1,
    }

    try:
        response = requests.get(f"{TMDB_BASE_URL}/search/movie", params=params, timeout=10)
        response.raise_for_status()
        results = response.json().get("results", [])
        return [format_movie(m) for m in results if m.get("poster_path")]
    except requests.exceptions.Timeout:
        raise RuntimeError("TMDB API 요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.")
    except requests.exceptions.HTTPError as e:
        raise RuntimeError(f"TMDB API 오류: {e.response.status_code}")
    except Exception as e:
        raise RuntimeError(f"영화 검색 중 오류가 발생했습니다: {str(e)}")


def format_movie(movie: dict):
    poster_path = movie.get("poster_path")
    backdrop_path = movie.get("backdrop_path")

    return {
        "tmdbId": movie.get("id"),
        "title": movie.get("title"),
        "originalTitle": movie.get("original_title"),
        "overview": movie.get("overview"),
        "posterUrl": f"{TMDB_IMAGE_BASE_URL}{poster_path}" if poster_path else None,
        "backdropUrl": f"https://image.tmdb.org/t/p/original{backdrop_path}" if backdrop_path else None,
        "rating": movie.get("vote_average"),
        "releaseDate": movie.get("release_date"),
    }


def get_movie_by_id(movie_id: int, language: str = "ko-KR") -> dict | None:
    if not TMDB_API_KEY:
        raise RuntimeError("TMDB_API_KEY가 설정되어 있지 않습니다.")

    try:
        response = requests.get(
            f"{TMDB_BASE_URL}/movie/{movie_id}",
            params={
                "api_key": TMDB_API_KEY,
                "language": language,
            },
            timeout=10,
        )
        response.raise_for_status()
        movie = response.json()

        if not movie.get("overview", "").strip() and not language.startswith("en"):
            fallback = requests.get(
                f"{TMDB_BASE_URL}/movie/{movie_id}",
                params={
                    "api_key": TMDB_API_KEY,
                    "language": "en-US",
                },
                timeout=10,
            )
            fallback.raise_for_status()
            fallback_data = fallback.json()
            movie["overview"] = fallback_data.get("overview", "")

        return format_movie(movie)
    except Exception:
        return None

async def get_movie_trailer(movie_id: int, language: str = "ko-KR") -> str:
    """TMDB에서 영화의 유튜브 트레일러 URL을 가져옵니다."""
    url = f"{TMDB_BASE_URL}/movie/{movie_id}/videos"
    params = {
        "api_key": TMDB_API_KEY,
        "language": language
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        
        if response.status_code == 200:
            videos = response.json().get("results", [])
            # 1. 사이트가 YouTube이고 타입이 Trailer인 영상 찾기
            for video in videos:
                if video.get("site") == "YouTube" and video.get("type") == "Trailer":
                    return video.get("key")
            
            # 2. 한국어 트레일러가 없으면 영어(기본) 트레일러로 다시 검색 (폴백 로직)
            if language != "en-US":
                params["language"] = "en-US"
                fallback_resp = await client.get(url, params=params)
                if fallback_resp.status_code == 200:
                    fallback_videos = fallback_resp.json().get("results", [])
                    for video in fallback_videos:
                        if video.get("site") == "YouTube" and video.get("type") == "Trailer":
                            return video.get("key")
                            
    return None