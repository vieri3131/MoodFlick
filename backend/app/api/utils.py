from fastapi import HTTPException
from app.api.auth import get_user_id_from_token


def extract_user_id(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization[len("Bearer "):]
    return get_user_id_from_token(token)
