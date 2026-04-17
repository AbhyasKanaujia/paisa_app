from __future__ import annotations
from datetime import datetime, timezone
from typing import Literal
from bson import ObjectId
from .db import get_db

AccountType = Literal["checking", "savings", "credit", "cash"]


class Account:
    collection_name = "accounts"

    def __init__(self, doc: dict):
        self._id: ObjectId = doc["_id"]
        self.user_id: ObjectId = doc["user_id"]
        self.name: str = doc["name"]
        self.type: AccountType = doc["type"]
        self.balance: float = doc["balance"]
        self.currency: str = doc.get("currency", "INR")
        self.created_at: datetime = doc.get("created_at", datetime.now(timezone.utc))

    # ------------------------------------------------------------------
    # Static methods
    # ------------------------------------------------------------------

    @staticmethod
    def _col():
        return get_db()[Account.collection_name]

    @staticmethod
    async def create(
        user_id: str | ObjectId,
        name: str,
        type: AccountType,
        balance: float = 0.0,
        currency: str = "INR",
    ) -> Account:
        doc = {
            "user_id": ObjectId(user_id),
            "name": name,
            "type": type,
            "balance": balance,
            "currency": currency,
            "created_at": datetime.now(timezone.utc),
        }
        result = await Account._col().insert_one(doc)
        doc["_id"] = result.inserted_id
        return Account(doc)

    @staticmethod
    async def find_by_user(user_id: str | ObjectId) -> list[Account]:
        cursor = Account._col().find({"user_id": ObjectId(user_id)})
        return [Account(doc) async for doc in cursor]

    @staticmethod
    async def find_by_id(account_id: str | ObjectId) -> Account | None:
        doc = await Account._col().find_one({"_id": ObjectId(account_id)})
        return Account(doc) if doc else None

    # ------------------------------------------------------------------
    # Object methods
    # ------------------------------------------------------------------

    def to_dict(self) -> dict:
        return {
            "id": str(self._id),
            "user_id": str(self.user_id),
            "name": self.name,
            "type": self.type,
            "balance": self.balance,
            "currency": self.currency,
            "created_at": self.created_at.isoformat(),
        }

    async def update_balance(self, amount: float) -> None:
        self.balance += amount
        await Account._col().update_one(
            {"_id": self._id}, {"$inc": {"balance": amount}}
        )

    async def delete(self) -> None:
        from .transaction import Transaction

        await Transaction._col().delete_many({"account_id": self._id})
        await Account._col().delete_one({"_id": self._id})
