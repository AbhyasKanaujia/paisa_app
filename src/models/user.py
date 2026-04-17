from __future__ import annotations
from datetime import datetime, timezone
from bson import ObjectId
from .db import get_db


class User:
    collection_name = "users"

    def __init__(self, doc: dict):
        self._id: ObjectId = doc["_id"]
        self.email: str = doc["email"]
        self.name: str = doc["name"]
        self.password_hash: str = doc.get("password_hash", "")
        self.created_at: datetime = doc.get("created_at", datetime.now(timezone.utc))

    # ------------------------------------------------------------------
    # Static methods
    # ------------------------------------------------------------------

    @staticmethod
    def _col():
        return get_db()[User.collection_name]

    @staticmethod
    async def create(email: str, name: str, password_hash: str = "") -> User:
        existing = await User._col().find_one({"email": email})
        if existing:
            raise ValueError("An account with that email already exists")
        doc = {
            "email": email,
            "name": name,
            "password_hash": password_hash,
            "created_at": datetime.now(timezone.utc),
        }
        result = await User._col().insert_one(doc)
        doc["_id"] = result.inserted_id
        return User(doc)

    @staticmethod
    async def find_by_email(email: str) -> User | None:
        doc = await User._col().find_one({"email": email})
        return User(doc) if doc else None

    @staticmethod
    async def find_by_id(user_id: str | ObjectId) -> User | None:
        doc = await User._col().find_one({"_id": ObjectId(user_id)})
        return User(doc) if doc else None

    # ------------------------------------------------------------------
    # Object methods
    # ------------------------------------------------------------------

    def to_dict(self) -> dict:
        return {
            "id": str(self._id),
            "email": self.email,
            "name": self.name,
            "created_at": self.created_at.isoformat(),
        }

    async def delete(self) -> None:
        from .account import Account
        from .transaction import Transaction

        await Transaction._col().delete_many({"user_id": self._id})
        await Account._col().delete_many({"user_id": self._id})
        await User._col().delete_one({"_id": self._id})
