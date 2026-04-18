# Paisa Agent — Decisions & Roadmap

## What this is

A conversational AI layer over the Paisa finance backend. Users interact with their financial data in natural language. The agent translates intent into tool calls against the existing services layer and streams back a response.

---

## Architecture decisions

### 1. No LangGraph (yet)

**Decision:** Simple JSON tool loop — LLM returns a JSON action, we execute it, feed the result back, LLM writes the final answer.

**Why:** LangGraph adds real value for multi-step branching, retries, and parallel tool execution. None of those are required for v1. The simple loop is easier to debug, test, and reason about. LangGraph can be introduced in Phase 3 without rewriting the tool definitions or chat history schema.

**Trigger to revisit:** When we need multi-hop reasoning (e.g. "compare this month to last month across all accounts") or retry/fallback logic.

---

### 2. Ollama + local model (gemma3:27b or similar)

**Decision:** Use Ollama for LLM inference. No cloud API calls.

**Why:** Data stays local. No per-token cost. Fits the self-hosted ethos of the app.

**Known risk:** Local models have inconsistent tool-calling. We mitigate this by enforcing structured output via a strict system prompt rather than relying on native function-calling APIs. The LLM must respond in one of two formats: a JSON tool call or a plain final answer. We parse and validate; if parsing fails, we re-prompt once before returning an error.

**Trigger to revisit:** If re-prompt retries exceed ~15% of requests in production, consider moving to a cloud model with reliable structured output (Claude, GPT-4o).

---

### 3. Streaming — final answer only

**Decision:** Stream tokens to the client only during the final answer phase. Tool calls happen silently server-side.

**Why:** Streaming mid-tool-call creates UX confusion (partial text appears, then gets replaced or corrected). The silent tool phase keeps latency invisible; the streamed answer feels responsive without being confusing.

**Implementation:** SSE via FastAPI `StreamingResponse`. Frontend uses `EventSource`.

---

### 4. Persistent conversation history in MongoDB

**Decision:** Store chat history in a `conversations` collection (one document per thread, messages array inside).

**Why:** In-memory history is lost on restart and cannot support multiple users or sessions. MongoDB is already the app's database — adding a collection costs nothing operationally.

**Schema:**
```
conversations: {
  _id: ObjectId,
  user_id: ObjectId,
  thread_id: str,          # UUID, owned by client
  messages: [
    { role: "user"|"assistant"|"tool", content: str, timestamp: datetime }
  ],
  created_at: datetime,
  updated_at: datetime
}
```

**Note:** This is separate from business data (transactions, accounts). Never mix.

---

### 5. Tools are thin wrappers over existing services

**Decision:** Agent tools call `AccountService` and `TransactionService` directly. No new DB logic lives in the agent layer.

**Why:** `src/services/` is already the boundary for DB access (per CLAUDE.md). Keeping agent tools as thin adapters means the services layer stays the single source of truth and remains independently testable.

---

### 6. Auth — agent inherits existing JWT

**Decision:** The `/chat` endpoint uses the same `get_current_user` dependency as all other routes. The agent always scopes tool calls to the authenticated user's ID.

**Why:** No new auth surface. The agent cannot access another user's data by construction.

---

## Tool inventory (v1)

| Tool | Description |
|------|-------------|
| `get_accounts` | List all accounts with current balances |
| `get_net_worth` | Return net worth (assets minus credit liabilities) |
| `get_transactions` | Query recent transactions, optionally filtered by account |
| `get_monthly_summary` | Income, expenses, net for a given month |
| `get_spending_by_category` | Expense breakdown by category for a date range |
| `record_transaction` | Create an income or expense transaction |
| `transfer` | Transfer funds between two accounts |

---

## Roadmap

### Phase 1 — Foundation (current)
- [x] README and decisions
- [ ] `tools.py` — tool definitions and execution
- [ ] `agent.py` — JSON tool loop with Ollama
- [ ] `chat_service.py` — conversation persistence
- [ ] `chat.py` router — SSE streaming endpoint
- [ ] `ChatPanel.jsx` — connect frontend to real backend

### Phase 2 — Robustness
- [ ] Structured output enforcement with re-prompt on parse failure
- [ ] Tool call validation (unknown account IDs, future dates, etc.)
- [ ] Conversation history trimming (sliding window to stay within context limit)
- [ ] Rate limiting on `/chat`
- [ ] Observability: log tool calls, latency, parse failures per user

### Phase 3 — Intelligence
- [ ] Introduce LangGraph if multi-step reasoning is needed
- [ ] Add `MongoDBSaver` as LangGraph checkpointer (replaces `chat_service.py`)
- [ ] Proactive insights: scheduled analysis, anomaly detection
- [ ] Support for follow-up context ("do the same for last month")
- [ ] Switch to a cloud model if local model reliability degrades

---

## File layout

```
src/agent/
├── README.md          # this file
├── __init__.py
├── tools.py           # tool definitions + execution functions
├── agent.py           # core loop: prompt → tool call → execute → answer
└── chat_service.py    # conversation history CRUD (MongoDB)

src/api/routers/
└── chat.py            # POST /chat — SSE streaming endpoint

frontend/src/
└── ChatPanel.jsx      # updated to consume SSE stream
```
