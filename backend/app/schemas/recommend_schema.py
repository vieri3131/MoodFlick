from pydantic import BaseModel, Field

class RecommendRequest(BaseModel):
    raw_mood: str = Field(..., min_length=1, max_length=500)
    country: str = ""
    language: str = "ko-KR"