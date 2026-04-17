from __future__ import annotations
import os
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from src.models import User

_JWT_ALGORITHM = "HS256"
_JWT_EXPIRY_HOURS = 24


def _secret() -> str:
    return os.environ["JWT_SECRET"]


class UserService:

    @staticmethod
    async def signup(email: str, name: str, password: str) -> User:
        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        return await User.create(email, name, password_hash)

    @staticmethod
    async def login(email: str, password: str) -> str:
        user = await User.find_by_email(email)
        if user is None or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
            raise ValueError("Invalid email or password")
        payload = {
            "sub": str(user._id),
            "email": user.email,
            "exp": datetime.now(timezone.utc) + timedelta(hours=_JWT_EXPIRY_HOURS),
        }
        return jwt.encode(payload, _secret(), algorithm=_JWT_ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> dict:
        return jwt.decode(token, _secret(), algorithms=[_JWT_ALGORITHM])
