from __future__ import annotations
from datetime import datetime, timezone
from bson import ObjectId
from .db import get_db


class Conversation:
    collection_name = "conversations"

    def __init__(self, doc: dict):
        self._id: ObjectId = doc["_id"]
        self.user_id: ObjectId = doc["user_id"]
        self.thread_id: str = doc["thread_id"]
        self.messages: list[dict] = doc.get("messages", [])
        self.created_at: datetime = doc.get("created_at", datetime.now(timezone.utc))
        self.updated_at: datetime = doc.get("updated_at", datetime.now(timezone.utc))

    # ------------------------------------------------------------------
    # Static methods
    # ------------------------------------------------------------------

    @staticmethod
    def _col():
        return get_db()[Conversation.collection_name]

    @staticmethod
    async def find_by_thread(user_id: str | ObjectId, thread_id: str) -> Conversation | None:
        doc = await Conversation._col().find_one(
            {"user_id": ObjectId(user_id), "thread_id": thread_id}
        )
        return Conversation(doc) if doc else None

    @staticmethod
    async def create(user_id: str | ObjectId, thread_id: str) -> Conversation:
        now = datetime.now(timezone.utc)
        doc = {
            "user_id": ObjectId(user_id),
            "thread_id": thread_id,
            "messages": [],
            "created_at": now,
            "updated_at": now,
        }
        result = await Conversation._col().insert_one(doc)
        doc["_id"] = result.inserted_id
        return Conversation(doc)

    # ------------------------------------------------------------------
    # Instance methods
    # ------------------------------------------------------------------

    def to_history(self) -> list[dict]:
        """Return messages as plain {role, content} dicts for LLM consumption."""
        return [{"role": m["role"], "content": m["content"]} for m in self.messages]

    async def append_message(self, role: str, content: str) -> None:
        msg = {"role": role, "content": content, "timestamp": datetime.now(timezone.utc)}
        self.messages.append(msg)
        await Conversation._col().update_one(
            {"_id": self._id},
            {
                "$push": {"messages": msg},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )
