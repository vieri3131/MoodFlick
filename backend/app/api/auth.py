from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

router = APIRouter(tags=["auth"])

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

class RegisterRequest(BaseModel):
    nickname: str
    email: str
    password: str
    confirm_password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(body: RegisterRequest):
    if body.password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    try:
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": { "nickname": body.nickname }
            }
        })
        if response.user is None:
            raise HTTPException(status_code=400, detail="Registration failed")
        return {
            "token": response.session.access_token,
            "nickname": body.nickname,
            "email": body.email
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(body: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })
        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        nickname = response.user.user_metadata.get("nickname", "")
        return {
            "token": response.session.access_token,
            "nickname": nickname,
            "email": body.email
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")
