from pydantic import BaseModel

class RecommendRequest(BaseModel):
    emotion: str
    country: str = "KR"
    language: str = "ko-KR"