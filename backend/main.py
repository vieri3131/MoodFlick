from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # 1. 추가
from app.api.movies import router as movies_router
from app.api.recommend import router as recommend_router

app = FastAPI()

# 2. CORS 설정 추가 (프론트엔드와 통신하기 위해 필수!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # 프론트엔드 주소 허용
    allow_credentials=True,
    allow_methods=["*"], # 모든 HTTP 메서드 허용
    allow_headers=["*"], # 모든 헤더 허용
)

app.include_router(movies_router)
app.include_router(recommend_router)

@app.get("/")
def root():
    return {"message": "MoodFlick API is running"}