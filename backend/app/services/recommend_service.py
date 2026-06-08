from app.services.tmdb_service import discover_movies
from app.services.ai_service import generate_reason

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
    "calm": [10402, 99],
    "lonely": [18, 10749],
    "angry": [28, 53],
    "tired": [10751, 16],
    "bored": [12, 35],
    "confused": [35, 10751],
    "nostalgic": [10749, 10402],
    "empty": [18, 878],
    "frustrated": [28, 18],
    "regretful": [18],
}

EMOTION_RECOMMENDATION_MAP = {
    "sad": {
        "label": "슬픔",
        "mood": "emotional",
        "genres": ["Drama", "Family"],
        "recommendation_style": "마음을 천천히 위로해주는 따뜻한 영화",
    },
    "happy": {
        "label": "행복",
        "mood": "feel_good",
        "genres": ["Comedy", "Adventure"],
        "recommendation_style": "기분 좋은 에너지를 더해주는 유쾌한 영화",
    },
    "romantic": {
        "label": "설렘",
        "mood": "romantic",
        "genres": ["Romance", "Drama"],
        "recommendation_style": "설렘과 관계의 감정을 부드럽게 이어주는 영화",
    },
    "scary": {
        "label": "무서움",
        "mood": "tense",
        "genres": ["Horror", "Thriller"],
        "recommendation_style": "긴장감과 몰입감을 강하게 느낄 수 있는 영화",
    },
    "excited": {
        "label": "신남",
        "mood": "exciting",
        "genres": ["Action", "Drama"],
        "recommendation_style": "활력과 재미를 크게 끌어올려주는 영화",
    },
    "calm": {
        "label": "평온함",
        "mood": "calm",
        "genres": ["Music", "Documentary"],
        "recommendation_style": "차분하고 안정된 마음으로 편안하게 볼 수 있는 영화",
    },
    "lonely": {
        "label": "외로움",
        "mood": "comforting",
        "genres": ["Drama", "Romance"],
        "recommendation_style": "외로운 마음을 조용히 달래주는 영화",
    },
    "angry": {
        "label": "분노",
        "mood": "cathartic",
        "genres": ["Action", "Thriller"],
        "recommendation_style": "쌓인 감정을 강한 전개로 풀어주는 영화",
    },
    "tired": {
        "label": "피곤함",
        "mood": "relaxing",
        "genres": ["Family", "Animation"],
        "recommendation_style": "지친 마음을 부담 없이 쉬게 해주는 영화",
    },
    "bored": {
        "label": "지루함",
        "mood": "fun",
        "genres": ["Adventure", "Comedy"],
        "recommendation_style": "무료함을 깨고 가볍게 즐길 수 있는 영화",
    },
    "confused": {
        "label": "혼란",
        "mood": "healing",
        "genres": ["Comedy", "Family"],
        "recommendation_style": "복잡한 생각을 덜어주고 편하게 볼 수 있는 영화",
    },
    "nostalgic": {
        "label": "그리움",
        "mood": "nostalgic",
        "genres": ["Romance", "Music"],
        "recommendation_style": "과거의 추억과 사람을 따뜻하게 떠올릴 수 있는 영화",
    },
    "empty": {
        "label": "허무함",
        "mood": "reflective",
        "genres": ["Drama", "Science Fiction"],
        "recommendation_style": "비어 있는 마음에 삶의 의미를 천천히 건네는 영화",
    },
    "frustrated": {
        "label": "답답함",
        "mood": "cathartic",
        "genres": ["Action", "Adventure"],
        "recommendation_style": "막힌 기분을 통쾌하게 풀어주는 도전과 극복의 영화",
    },
    "regretful": {
        "label": "후회",
        "mood": "redemptive",
        "genres": ["Drama"],
        "recommendation_style": "지난 선택을 돌아보고 다시 나아갈 힘을 주는 영화",
    },
}

ALLOWED_EMOTIONS = list(EMOTION_GENRE_MAP.keys())


def normalize_emotion(emotion: str) -> str:
    return emotion.strip().lower()


def emotion_to_genre_ids(emotion: str) -> list[int]:
    return EMOTION_GENRE_MAP[normalize_emotion(emotion)]


def get_emotion_recommendation(emotion: str) -> dict:
    return EMOTION_RECOMMENDATION_MAP[normalize_emotion(emotion)]


def build_recommend_response(
    success: bool,
    message: str,
    emotion: str,
    genre_ids: list[int],
    country: str,
    language: str,
    movies: list[dict],
):
    recommendation = (
        get_emotion_recommendation(emotion)
        if normalize_emotion(emotion) in EMOTION_RECOMMENDATION_MAP
        else {}
    )

    return {
        "success": success,
        "message": message,
        "emotion": emotion,
        "emotionLabel": recommendation.get("label"),
        "mood": recommendation.get("mood"),
        "genres": recommendation.get("genres", []),
        "recommendation_style": recommendation.get("recommendation_style"),
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


def add_recommend_reason(movies: list[dict], raw_mood: str, language: str) -> list[dict]:
    result = []
    for movie in movies:
        reason = generate_reason(raw_mood, movie["title"], language)
        result.append({**movie, "recommendReason": reason})
    return result


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


def recommend_movies(emotion: str, raw_mood: str, country: str, language: str):
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

    recommended_movies = add_recommend_reason(
    limit_unique_movies(movies),
    raw_mood=raw_mood,
    language=language)
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
