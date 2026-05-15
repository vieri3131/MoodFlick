from fastapi import APIRouter
from app.schemas.recommend_schema import RecommendRequest
from app.services.recommend_service import recommend_movies

router = APIRouter(prefix="/api", tags=["recommend"])

@router.post("/recommend")
def recommend(request: RecommendRequest):
    return recommend_movies(
        emotion=request.emotion,
        country=request.country,
        language=request.language
    )