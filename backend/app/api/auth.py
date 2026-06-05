from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os
import json
import hashlib
import secrets
import uuid
from pathlib import Path

router = APIRouter(tags=["auth"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

LOCAL_USER_FILE = Path(__file__).resolve().parents[2] / "local_users.json"


def _load_local_users():
    if not LOCAL_USER_FILE.exists():
        return {}
    try:
        with LOCAL_USER_FILE.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_local_users(users):
    LOCAL_USER_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOCAL_USER_FILE.open("w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _generate_local_token() -> str:
    return "local:" + secrets.token_urlsafe(32)


def _create_local_user(nickname: str, email: str, password: str) -> dict:
    users = _load_local_users()
    if email in users:
        raise HTTPException(status_code=400, detail="Email already exists")

    user_id = str(uuid.uuid4())
    token = _generate_local_token()
    users[email] = {
        "id": user_id,
        "nickname": nickname,
        "password_hash": _hash_password(password),
        "token": token
    }
    _save_local_users(users)
    return {
        "token": token,
        "nickname": nickname,
        "email": email,
        "id": user_id
    }


def _verify_local_login(email: str, password: str) -> dict | None:
    users = _load_local_users()
    user = users.get(email)
    if not user:
        return None
    if user.get("password_hash") != _hash_password(password):
        return None
    return {"email": email, **user}


def _find_local_user_by_token(token: str) -> dict | None:
    if not token.startswith("local:"):
        return None
    users = _load_local_users()
    for email, user in users.items():
        if user.get("token") == token:
            return {"email": email, **user}
    return None


def get_user_id_from_token(token: str) -> str:
    if token.startswith("local:"):
        local_user = _find_local_user_by_token(token)
        if local_user:
            return local_user["id"]
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=401, detail="Authentication is not configured")

    try:
        result = supabase.auth.get_user(token)
        return result.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


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

    if not body.nickname.strip() or not body.email.strip():
        raise HTTPException(status_code=400, detail="Nickname and email are required")

    # Try Supabase first, but fallback to local auth if signup fails.
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            response = supabase.auth.sign_up({
                "email": body.email,
                "password": body.password,
                "options": {
                    "data": { "nickname": body.nickname }
                }
            })
            if response.user is None or response.session is None:
                raise Exception("Registration failed")
            return {
                "token": response.session.access_token,
                "nickname": body.nickname,
                "email": body.email
            }
        except Exception as e:
            error_text = str(e).lower()
            if "email rate limit" in error_text or "unable to signup" in error_text or "registration failed" in error_text:
                local_user = _create_local_user(body.nickname, body.email, body.password)
                return {
                    "token": local_user["token"],
                    "nickname": local_user["nickname"],
                    "email": local_user["email"]
                }
            raise HTTPException(status_code=400, detail=str(e))

    local_user = _create_local_user(body.nickname, body.email, body.password)
    return {
        "token": local_user["token"],
        "nickname": local_user["nickname"],
        "email": local_user["email"]
    }


@router.post("/login")
def login(body: LoginRequest):
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            response = supabase.auth.sign_in_with_password({
                "email": body.email,
                "password": body.password
            })
            if response.user is not None and response.session is not None:
                nickname = response.user.user_metadata.get("nickname", "")
                return {
                    "token": response.session.access_token,
                    "nickname": nickname,
                    "email": body.email
                }
        except Exception:
            pass

    local_user = _verify_local_login(body.email, body.password)
    if local_user:
        return {
            "token": local_user["token"],
            "nickname": local_user["nickname"],
            "email": local_user["email"]
        }

    raise HTTPException(status_code=401, detail="Invalid email or password")
