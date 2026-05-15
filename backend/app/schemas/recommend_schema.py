from pydantic import BaseModel

class RecommendRequest(BaseModel):
    raw_mood: str #replace emotion with rawmood
    country: str = "KR"
    language: str = "ko-KR"