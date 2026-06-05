from fastapi import APIRouter, HTTPException, Header
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
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_SERVICE_ROLE_KEY else None

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


def _get_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization.removeprefix("Bearer ") if hasattr(authorization, "removeprefix") else authorization[len("Bearer "):]


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

class ProfileUpdateRequest(BaseModel):
    nickname: str | None = None
    email: str | None = None
    password: str | None = None

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


@router.get("/profile")
def get_profile(authorization: str | None = Header(default=None)):
    token = _get_bearer_token(authorization)

    local_user = _find_local_user_by_token(token)
    if local_user:
        return {
            "nickname": local_user.get("nickname", ""),
            "email": local_user.get("email", ""),
            "hasPassword": True
        }

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
    local_user = _find_local_user_by_token(token)

    if not any([body.nickname is not None, body.email is not None, body.password is not None]):
        raise HTTPException(status_code=400, detail="No profile changes provided")

    if local_user:
        users = _load_local_users()
        current_email = local_user["email"]
        user = users.get(current_email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        next_email = body.email.strip() if body.email is not None else current_email
        if not next_email:
            raise HTTPException(status_code=400, detail="Email is required")
        if next_email != current_email and next_email in users:
            raise HTTPException(status_code=400, detail="Email already exists")

        if body.nickname is not None:
            nickname = body.nickname.strip()
            if not nickname:
                raise HTTPException(status_code=400, detail="Nickname is required")
            user["nickname"] = nickname

        if body.password is not None:
            if len(body.password) < 6:
                raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
            user["password_hash"] = _hash_password(body.password)

        if next_email != current_email:
            users[next_email] = user
            del users[current_email]
        else:
            users[current_email] = user

        _save_local_users(users)
        return {
            "nickname": user.get("nickname", ""),
            "email": next_email,
            "hasPassword": True
        }

    try:
        response = supabase.auth.get_user(token)
        user = response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if supabase_admin is None:
        raise HTTPException(
            status_code=501,
            detail="Profile updates for Supabase users require SUPABASE_SERVICE_ROLE_KEY"
        )

    updates = {}
    metadata = dict(user.user_metadata or {})

    if body.nickname is not None:
        nickname = body.nickname.strip()
        if not nickname:
            raise HTTPException(status_code=400, detail="Nickname is required")
        metadata["nickname"] = nickname
        updates["user_metadata"] = metadata

    if body.email is not None:
        email = body.email.strip()
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        updates["email"] = email

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
