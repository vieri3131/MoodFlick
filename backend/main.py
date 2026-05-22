from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.movies import router as movies_router
from app.api.recommend import router as recommend_router

app = FastAPI()

app.include_router(movies_router)
app.include_router(recommend_router)

@app.get("/")
def root():
    return {"message": "MoodFlick API is running"}