from app.services.tmdb_service import discover_movies

RECOMMENDATION_LIMIT = 5
DEFAULT_RECOMMEND_REASON = "입력한 감정과 분위기에 어울리는 영화입니다."
SUCCESS_MESSAGE = "추천 결과를 불러왔습니다."
EMPTY_RESULT_MESSAGE = "검색 결과가 없습니다. 감정 표현이나 국가 필터를 변경해 주세요."
UNSUPPORTED_EMOTION_MESSAGE = "지원하지 않는 감정값입니다."

EMOTION_GENRE_MAP = {
    "sad": [18, 10751],
    "happy": [35, 12],
    "romantic": [10749, 18],
    "scary": [27, 53],
    "excited": [28, 12],
    "calm": [10751, 18],
    "lonely": [18, 10749],
    "angry": [28, 53],
    "tired": [10751, 16],
    "bored": [12, 35],
}

ALLOWED_EMOTIONS = list(EMOTION_GENRE_MAP.keys())


def normalize_emotion(emotion: str) -> str:
    return emotion.strip().lower()


def emotion_to_genre_ids(emotion: str) -> list[int]:
    return EMOTION_GENRE_MAP[normalize_emotion(emotion)]


def build_recommend_response(
    success: bool,
    message: str,
    emotion: str,
    genre_ids: list[int],
    country: str,
    language: str,
    movies: list[dict],
):
    return {
        "success": success,
        "message": message,
        "emotion": emotion,
        "genreIds": genre_ids,
        "country": country,
        "language": language,
        "count": len(movies),
        "movies": movies,
    }


def build_unsupported_emotion_response(emotion: str, country: str, language: str):
    response = build_recommend_response(
        success=False,
        message=UNSUPPORTED_EMOTION_MESSAGE,
        emotion=emotion,
        genre_ids=[],
        country=country,
        language=language,
        movies=[],
    )
    response["allowedEmotions"] = ALLOWED_EMOTIONS
    return response


def add_recommend_reason(movies: list[dict]) -> list[dict]:
    return [
        {
            **movie,
            "recommendReason": DEFAULT_RECOMMEND_REASON,
        }
        for movie in movies
    ]


def merge_unique_movies(
    selected_movies: list[dict],
    new_movies: list[dict],
    limit: int = RECOMMENDATION_LIMIT,
) -> list[dict]:
    seen_ids = {movie.get("tmdbId") for movie in selected_movies}

    for movie in new_movies:
        tmdb_id = movie.get("tmdbId")

        if tmdb_id in seen_ids:
            continue

        selected_movies.append(movie)
        seen_ids.add(tmdb_id)

        if len(selected_movies) >= limit:
            break

    return selected_movies


def limit_unique_movies(
    movies: list[dict],
    limit: int = RECOMMENDATION_LIMIT,
) -> list[dict]:
    return merge_unique_movies([], movies, limit)


def search_movies_by_genres(
    genre_ids: list[int],
    country: str | None,
    language: str,
    min_rating: float,
) -> list[dict]:
    return discover_movies(
        genre_ids=genre_ids,
        country=country,
        language=language,
        min_rating=min_rating,
    )


def recommend_movies(emotion: str, country: str, language: str):
    if normalize_emotion(emotion) not in EMOTION_GENRE_MAP:
        return build_unsupported_emotion_response(
            emotion=emotion,
            country=country,
            language=language,
        )

    genre_ids = emotion_to_genre_ids(emotion)

    movies = search_movies_by_genres(
        genre_ids=genre_ids,
        country=country,
        language=language,
        min_rating=6.5,
    )

    if len(movies) < RECOMMENDATION_LIMIT:
        fallback_movies = search_movies_by_genres(
            genre_ids=genre_ids,
            country=None,
            language=language,
            min_rating=6.5,
        )
        merge_unique_movies(movies, fallback_movies)

    if len(movies) < RECOMMENDATION_LIMIT:
        fallback_movies = search_movies_by_genres(
            genre_ids=genre_ids,
            country=None,
            language=language,
            min_rating=5.5,
        )
        merge_unique_movies(movies, fallback_movies)

    recommended_movies = add_recommend_reason(limit_unique_movies(movies))
    success = bool(recommended_movies)
    message = SUCCESS_MESSAGE if success else EMPTY_RESULT_MESSAGE

    return build_recommend_response(
        success=success,
        message=message,
        emotion=emotion,
        genre_ids=genre_ids,
        country=country,
        language=language,
        movies=recommended_movies,
    )
