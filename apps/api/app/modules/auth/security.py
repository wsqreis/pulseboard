from __future__ import annotations

import hashlib
import secrets
from datetime import timedelta
from typing import Any, cast

from argon2 import PasswordHasher
from jose import JWTError, jwt

from app.core.config import Settings
from app.core.time import utc_now

password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except Exception:
        return False


def create_access_token(user_id: str, settings: Settings) -> str:
    expires_at = utc_now() + timedelta(minutes=settings.jwt_access_token_ttl_minutes)
    payload: dict[str, Any] = {"sub": user_id, "exp": expires_at, "type": "access"}
    encoded = jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")
    return cast(str, encoded)


def decode_access_token(token: str, settings: Settings) -> dict[str, Any]:
    decoded = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
    return cast(dict[str, Any], decoded)


def build_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def build_one_time_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def is_access_token_invalid(token: str, settings: Settings) -> bool:
    try:
        payload = decode_access_token(token, settings)
    except JWTError:
        return True
    return payload.get("type") != "access"
