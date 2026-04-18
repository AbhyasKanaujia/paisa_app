from __future__ import annotations
import json
import re
import os
from typing import AsyncIterator
import httpx
from .tools import TOOL_SCHEMAS, execute_tool
from src.utils.logs import get_logger

logger = get_logger(__name__)

# Langfuse must be initialized after env vars are loaded (done in main.py).
# get_client() returns a singleton — safe to call at import time here because
# this module is only imported after load_dotenv() runs in main.py.
from langfuse import get_client, propagate_attributes

_langfuse_enabled = bool(os.getenv("LANGFUSE_SECRET_KEY"))
_langfuse = get_client() if _langfuse_enabled else None  # type: ignore[assignment]

_OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/v1").rstrip("/")
OLLAMA_URL = f"{_OLLAMA_BASE}/api/chat"
MODEL = os.getenv("OLLAMA_MODEL", "gemma3:27b-cloud")

_SYSTEM_PROMPT = """You are Paisa, a personal finance assistant. You have access to the user's financial data through tools.

To call a tool, respond with ONLY a JSON object on a single line in this exact format:
{"tool": "<tool_name>", "args": {<arguments>}}

Available tools:
""" + json.dumps(TOOL_SCHEMAS, indent=2) + """

Rules:
- If you need data to answer the question, call a tool first.
- After receiving tool results, write a clear, concise answer in plain text.
- Never call a tool in your final answer — only plain text in the final answer.
- If no tool is needed, answer directly.
- Always be helpful and specific with numbers and dates.
- Format currency amounts in INR with the ₹ symbol.
"""

_TOOL_CALL_RE = re.compile(r'^\s*\{.*"tool"\s*:.*\}\s*$', re.DOTALL)


def _is_tool_call(text: str) -> bool:
    return bool(_TOOL_CALL_RE.match(text))


def _parse_tool_call(text: str) -> tuple[str, dict] | None:
    try:
        obj = json.loads(text.strip())
        if "tool" in obj:
            return obj["tool"], obj.get("args", {})
    except json.JSONDecodeError:
        pass
    return None


async def _ollama_complete(messages: list[dict]) -> tuple[str, dict]:
    """Non-streaming call to Ollama. Returns (content, usage_details)."""
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(OLLAMA_URL, json={
            "model": MODEL,
            "messages": messages,
            "stream": False,
        })
        resp.raise_for_status()
        data = resp.json()
        content = data["message"]["content"]
        usage = {
            "input": data.get("prompt_eval_count", 0),
            "output": data.get("eval_count", 0),
        }
        return content, usage


async def _ollama_stream(messages: list[dict]) -> AsyncIterator[str]:
    """Streaming call to Ollama. Used for the final answer phase."""
    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream("POST", OLLAMA_URL, json={
            "model": MODEL,
            "messages": messages,
            "stream": True,
        }) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line:
                    continue
                try:
                    chunk = json.loads(line)
                    token = chunk.get("message", {}).get("content", "")
                    if token:
                        yield token
                    if chunk.get("done"):
                        break
                except json.JSONDecodeError:
                    continue


async def run(
    user_message: str,
    history: list[dict],
    user_id: str,
    session_id: str | None = None,
) -> AsyncIterator[str]:
    """
    Core agent loop. Yields final-answer tokens as they stream from Ollama.
    Tool calls happen silently between yields.
    """
    logger.info("agent.run user=%s session=%s message=%r", user_id, session_id, user_message)

    messages = [{"role": "system", "content": _SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    if _langfuse_enabled:
        async for token in _run_traced(user_message, messages, user_id, session_id):
            yield token
    else:
        async for token in _run_untraced(messages):
            yield token


async def _run_untraced(messages: list[dict]) -> AsyncIterator[str]:
    for i in range(5):
        response, _ = await _ollama_complete(messages)
        logger.debug("ollama response (iter %d): %r", i, response[:200])

        if not _is_tool_call(response):
            yield response
            return

        parsed = _parse_tool_call(response)
        if parsed is None:
            logger.warning("failed to parse tool call: %r", response)
            yield response
            return

        tool_name, tool_args = parsed
        logger.info("tool call: %s args=%s", tool_name, tool_args)
        tool_result = await execute_tool(tool_name, tool_args, "")
        logger.debug("tool result: %r", str(tool_result)[:200])

        messages.append({"role": "assistant", "content": response})
        messages.append({"role": "user", "content": f"Tool result: {tool_result}"})

    async for token in _ollama_stream(messages):
        yield token


async def _run_traced(
    user_message: str,
    messages: list[dict],
    user_id: str,
    session_id: str | None,
) -> AsyncIterator[str]:
    final_answer_parts: list[str] = []

    # start_as_current_observation activates the OTel context so child spans
    # nest properly. Yielding inside a `with` block is safe — Python only calls
    # __exit__ when the block actually ends, not on each yield.
    with _langfuse.start_as_current_observation(
        name="chat-response",
        as_type="agent",
        input=user_message,
        metadata={"model": MODEL},
    ) as root_span:
        with propagate_attributes(
            user_id=user_id,
            session_id=session_id,
            trace_name="chat-response",
        ):
            try:
                for i in range(5):
                    with _langfuse.start_as_current_observation(
                        name="llm-complete",
                        as_type="generation",
                        input=messages[-1]["content"],
                        model=MODEL,
                    ) as llm_span:
                        response, usage = await _ollama_complete(messages)
                        llm_span.update(output=response, usage_details=usage)
                    logger.debug("ollama response (iter %d): %r", i, response[:200])

                    if not _is_tool_call(response):
                        final_answer_parts.append(response)
                        yield response
                        return

                    parsed = _parse_tool_call(response)
                    if parsed is None:
                        logger.warning("failed to parse tool call: %r", response)
                        yield response
                        return

                    tool_name, tool_args = parsed
                    logger.info("tool call: %s args=%s", tool_name, tool_args)
                    with _langfuse.start_as_current_observation(
                        name=tool_name,
                        as_type="tool",
                        input=tool_args,
                    ) as tool_span:
                        tool_result = await execute_tool(tool_name, tool_args, user_id)
                        tool_span.update(output=_summarize_tool_result(tool_name, tool_result))
                    logger.debug("tool result: %r", str(tool_result)[:200])

                    messages.append({"role": "assistant", "content": response})
                    messages.append({"role": "user", "content": f"Tool result: {tool_result}"})

                logger.info("streaming final answer for user=%s", user_id)
                async for token in _ollama_stream(messages):
                    final_answer_parts.append(token)
                    yield token
            finally:
                root_span.update(output="".join(final_answer_parts) or None)


def _summarize_tool_result(tool_name: str, result: str) -> str:
    """Return a summary safe for tracing — avoids logging raw financial records."""
    if tool_name in ("get_transactions",):
        # result is a list repr; count items instead of logging all rows
        count = result.count("'id'")
        return f"[{count} transaction(s) returned]"
    # For other tools the result is short (net worth, summary dict) — log as-is
    # but cap at 500 chars to avoid oversized spans
    return result[:500]
