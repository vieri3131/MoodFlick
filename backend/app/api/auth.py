from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from supabase import create_client
import os

router = APIRouter(tags=["auth"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_SERVICE_ROLE_KEY else None


def _get_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization[len("Bearer "):]


def get_user_id_from_token(token: str) -> str:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=503, detail="Authentication service is not configured")
    try:
        result = supabase.auth.get_user(token)
        return result.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

class RefreshRequest(BaseModel):
    refresh_token: str

class RegisterRequest(BaseModel):
    nickname: str
    email: str
    password: str
    confirm_password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    nickname: str | None = None
    email: str | None = None
    password: str | None = None
    current_password: str | None = None

@router.post("/refresh")
def refresh_token(body: RefreshRequest):
    try:
        response = supabase.auth.refresh_session(body.refresh_token)
        if response.session is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        return {
            "token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Session refresh failed")

@router.post("/register")
def register(body: RegisterRequest):
    if body.password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if not body.nickname.strip() or not body.email.strip():
        raise HTTPException(status_code=400, detail="Nickname and email are required")
    try:
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {"nickname": body.nickname}
            }
        })
        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=400,
                detail="Registration failed — ensure email confirmation is disabled in Supabase dashboard"
            )
        return {
            "token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "nickname": body.nickname,
            "email": body.email
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(body: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password
        })
        if response.user is None or response.session is None:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        nickname = response.user.user_metadata.get("nickname", "") if response.user.user_metadata else ""
        return {
            "token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "nickname": nickname,
            "email": body.email
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/profile")
def get_profile(authorization: str | None = Header(default=None)):
    token = _get_bearer_token(authorization)
    try:
        response = supabase.auth.get_user(token)
        user = response.user
        return {
            "nickname": user.user_metadata.get("nickname", "") if user.user_metadata else "",
            "email": user.email,
            "hasPassword": True
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.patch("/profile")
def update_profile(body: ProfileUpdateRequest, authorization: str | None = Header(default=None)):
    token = _get_bearer_token(authorization)

    if body.email is not None:
        raise HTTPException(status_code=400, detail="Email cannot be changed")

    if not any([body.nickname is not None, body.password is not None]):
        raise HTTPException(status_code=400, detail="No profile changes provided")

    try:
        response = supabase.auth.get_user(token)
        user = response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if supabase_admin is None:
        raise HTTPException(
            status_code=501,
            detail="Profile updates require SUPABASE_SERVICE_ROLE_KEY to be configured"
        )

    updates = {}
    metadata = dict(user.user_metadata or {})

    if not body.current_password:
        raise HTTPException(status_code=400, detail="Current password is required")

    try:
        supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": body.current_password
        })
    except Exception:
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if body.nickname is not None:
        nickname = body.nickname.strip()
        if not nickname:
            raise HTTPException(status_code=400, detail="Nickname is required")
        metadata["nickname"] = nickname
        updates["user_metadata"] = metadata

    if body.password is not None:
        if len(body.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        updates["password"] = body.password

    try:
        updated = supabase_admin.auth.admin.update_user_by_id(user.id, updates)
        updated_user = updated.user
        return {
            "nickname": (updated_user.user_metadata or {}).get("nickname", ""),
            "email": updated_user.email,
            "hasPassword": True
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
