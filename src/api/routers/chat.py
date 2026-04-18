from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from src.api.deps import get_current_user
from src.agent import agent, chat_service
from src.utils.logs import get_logger

logger = get_logger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    thread_id: str | None = None


@router.post("")
async def chat(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    thread_id = body.thread_id or str(uuid.uuid4())
    message = body.message.strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        history = await chat_service.get_history(user_id, thread_id)
        await chat_service.append_message(user_id, thread_id, "user", message)
    except Exception:
        logger.exception("chat_service error for user=%s thread=%s", user_id, thread_id)
        raise HTTPException(status_code=500, detail="Failed to load conversation history")

    async def event_stream():
        full_response = []
        try:
            yield f"data: {thread_id}\n\n"  # first event carries the thread_id
            async for token in agent.run(message, history, user_id, session_id=thread_id):
                full_response.append(token)
                safe = token.replace("\n", "\\n")
                yield f"data: {safe}\n\n"
            yield "data: [DONE]\n\n"
        except Exception:
            logger.exception("Agent error for user=%s thread=%s", user_id, thread_id)
            yield "data: [ERROR]\n\n"
        finally:
            if full_response:
                await chat_service.append_message(
                    user_id, thread_id, "assistant", "".join(full_response)
                )

    return StreamingResponse(event_stream(), media_type="text/event-stream")
