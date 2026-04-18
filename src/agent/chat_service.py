from __future__ import annotations
from src.models.conversation import Conversation


async def get_or_create(user_id: str, thread_id: str) -> Conversation:
    conv = await Conversation.find_by_thread(user_id, thread_id)
    if conv is None:
        conv = await Conversation.create(user_id, thread_id)
    return conv


async def get_history(user_id: str, thread_id: str) -> list[dict]:
    conv = await Conversation.find_by_thread(user_id, thread_id)
    return conv.to_history() if conv else []


async def append_message(user_id: str, thread_id: str, role: str, content: str) -> None:
    conv = await get_or_create(user_id, thread_id)
    await conv.append_message(role, content)
