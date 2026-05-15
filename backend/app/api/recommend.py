from fastapi import APIRouter
from app.schemas.recommend_schema import RecommendRequest
from app.services.recommend_service import recommend_movies
from app.services.gemini_service import parse_mood

router = APIRouter(prefix="/api", tags=["recommend"])

@router.post("/recommend")
def recommend(request: RecommendRequest):
    emotion = parse_mood(request.raw_mood)
    
    return recommend_movies(
        emotion=emotion,
        raw_mood=request.raw_mood,
        country=request.country,
        language=request.language
    )