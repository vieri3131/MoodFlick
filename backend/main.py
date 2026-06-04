import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 1. 환경 변수 로드
load_dotenv()

from app.api.movies import router as movies_router
from app.api.recommend import router as recommend_router
from app.api.auth import router as auth_router
from app.api.watchlist import router as watchlist_router
from app.api.watch_history import router as watch_history_router

app = FastAPI()

# 2. CORS 완벽 허용 설정 (매우 중요!)
# 프론트엔드에서 접속할 수 있는 모든 로컬 주소를 허용 목록에 추가합니다.
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mood-flick-sigma.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # GET, POST, OPTIONS 등 모든 메서드 허용
    allow_headers=["*"], # 모든 헤더 허용
)

# 3. 라우터 등록
app.include_router(movies_router, prefix="/api")
app.include_router(recommend_router, prefix="/api")

# 프론트엔드 코드(auth.js)에서 /auth/register 로 요청을 보내고 있다면 아래와 같이 prefix 설정
app.include_router(auth_router, prefix="/auth")
app.include_router(watchlist_router, prefix="/api")
app.include_router(watch_history_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "MoodFlick API is perfectly running!"}