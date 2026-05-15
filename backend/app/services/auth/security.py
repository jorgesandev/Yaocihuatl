from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
from uuid import uuid4

import jwt

from app.core.config import get_settings


PASSWORD_ITERATIONS = 210_000


def hash_password(password: str, salt: bytes | None = None) -> str:
    selected_salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        selected_salt,
        PASSWORD_ITERATIONS,
    )
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${selected_salt.hex()}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt_hex, expected_hex = password_hash.split("$", 3)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt_hex),
        int(iterations),
    )
    return hmac.compare_digest(digest.hex(), expected_hex)


def token_secret() -> str:
    settings = get_settings()
    if settings.jwt_secret:
        return settings.jwt_secret
    if settings.app_env == "production":
        raise RuntimeError("JWT_SECRET is required in production.")
    return "dev-only-yaocihuatl-demo-secret-32-bytes-minimum"


def create_access_token(user_id: str, username: str, roles: list[str]) -> tuple[str, str, datetime]:
    settings = get_settings()
    issued_at = datetime.now(timezone.utc)
    expires_at = issued_at + timedelta(minutes=settings.access_token_expire_minutes)
    token_jti = uuid4().hex
    payload = {
        "sub": user_id,
        "username": username,
        "roles": roles,
        "jti": token_jti,
        "iat": int(issued_at.timestamp()),
        "exp": expires_at,
    }
    token = jwt.encode(payload, token_secret(), algorithm="HS256")
    return token, token_jti, expires_at


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, token_secret(), algorithms=["HS256"])
