from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.movies import router as movies_router
from app.api.recommend import router as recommend_router

app = FastAPI()

# 👇 프론트엔드 통신 허용을 위한 CORS 설정 복구
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 출처 허용
    allow_credentials=True,
    allow_methods=["*"],  # OPTIONS, POST, GET 등 모든 메서드 허용
    allow_headers=["*"],
)

app.include_router(movies_router)
app.include_router(recommend_router)

@app.get("/")
def root():
    return {"message": "MoodFlick API is running"}