from __future__ import annotations
from datetime import datetime, timezone
from typing import Literal
from bson import ObjectId
from .db import get_db

TransactionType = Literal["income", "expense", "transfer"]


class Transaction:
    collection_name = "transactions"

    def __init__(self, doc: dict):
        self._id: ObjectId = doc["_id"]
        self.user_id: ObjectId = doc["user_id"]
        self.account_id: ObjectId = doc["account_id"]
        self.amount: float = doc["amount"]
        self.type: TransactionType = doc["type"]
        self.category: str = doc.get("category", "")
        self.description: str = doc.get("description", "")
        self.date: datetime = doc["date"]
        self.created_at: datetime = doc.get("created_at", datetime.now(timezone.utc))

    # ------------------------------------------------------------------
    # Static methods
    # ------------------------------------------------------------------

    @staticmethod
    def _col():
        return get_db()[Transaction.collection_name]

    @staticmethod
    async def create(
        user_id: str | ObjectId,
        account_id: str | ObjectId,
        amount: float,
        type: TransactionType,
        date: datetime,
        category: str = "",
        description: str = "",
    ) -> Transaction:
        doc = {
            "user_id": ObjectId(user_id),
            "account_id": ObjectId(account_id),
            "amount": amount,
            "type": type,
            "category": category,
            "description": description,
            "date": date,
            "created_at": datetime.now(timezone.utc),
        }
        result = await Transaction._col().insert_one(doc)
        doc["_id"] = result.inserted_id
        return Transaction(doc)

    @staticmethod
    async def find_by_account(account_id: str | ObjectId) -> list[Transaction]:
        cursor = Transaction._col().find({"account_id": ObjectId(account_id)})
        return [Transaction(doc) async for doc in cursor]

    @staticmethod
    async def find_by_user(user_id: str | ObjectId) -> list[Transaction]:
        cursor = Transaction._col().find(
            {"user_id": ObjectId(user_id)}, sort=[("date", -1)]
        )
        return [Transaction(doc) async for doc in cursor]

    @staticmethod
    async def find_by_date_range(
        user_id: str | ObjectId, start: datetime, end: datetime
    ) -> list[Transaction]:
        cursor = Transaction._col().find(
            {"user_id": ObjectId(user_id), "date": {"$gte": start, "$lte": end}},
            sort=[("date", -1)],
        )
        return [Transaction(doc) async for doc in cursor]

    @staticmethod
    async def get_categories(user_id: str | ObjectId) -> list[str]:
        return await Transaction._col().distinct(
            "category", {"user_id": ObjectId(user_id)}
        )

    # ------------------------------------------------------------------
    # Object methods
    # ------------------------------------------------------------------

    def to_dict(self) -> dict:
        return {
            "id": str(self._id),
            "user_id": str(self.user_id),
            "account_id": str(self.account_id),
            "amount": self.amount,
            "type": self.type,
            "category": self.category,
            "description": self.description,
            "date": self.date.isoformat(),
            "created_at": self.created_at.isoformat(),
        }

    async def update(
        self,
        amount: float | None = None,
        category: str | None = None,
        description: str | None = None,
        date: datetime | None = None,
    ) -> None:
        changes: dict = {}
        if amount is not None:
            changes["amount"] = amount
            self.amount = amount
        if category is not None:
            changes["category"] = category
            self.category = category
        if description is not None:
            changes["description"] = description
            self.description = description
        if date is not None:
            changes["date"] = date
            self.date = date
        if changes:  # pragma: no branch
            await Transaction._col().update_one({"_id": self._id}, {"$set": changes})

    async def delete(self) -> None:
        await Transaction._col().delete_one({"_id": self._id})
