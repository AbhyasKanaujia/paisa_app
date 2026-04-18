# Paisa

A personal finance app with a conversational AI layer. Track accounts, record transactions, and analyze spending — via a REST API or by chatting with an AI assistant — all backed by MongoDB.

## Features

- JWT-based authentication (signup / login)
- Multiple account types: checking, savings, credit, cash
- Record income, expenses, and transfers between accounts
- Monthly summaries and spending breakdowns by category
- Net worth calculation (credit accounts treated as liabilities)
- Conversational AI assistant — query and record transactions in natural language
- Persistent conversation history per user thread (MongoDB-backed)
- Streaming responses via Server-Sent Events

## Tech Stack

**Backend**
- **Python 3.12+**
- **FastAPI** — REST API framework
- **Motor** — async MongoDB driver
- **bcrypt** — password hashing
- **PyJWT** — JWT tokens
- **httpx** — async HTTP client (Ollama requests)
- **Ollama** — local LLM inference (`gemma3:27b`)

**Frontend** (`frontend/`)
- **Vite + React** — dev server with HMR
- **Tailwind CSS** — utility-first styling
- **Axios** — HTTP client with JWT interceptor

## Requirements

- Python 3.12+
- MongoDB instance (local or Atlas)
- [Ollama](https://ollama.com) running locally with `gemma3:27b` pulled

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=paisa
JWT_SECRET=your-secret-key-here
```

## Running the Server

**Backend:**
```bash
python main.py
```
API available at `http://localhost:8000`. Swagger UI at `http://localhost:8000/docs`.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
App available at `http://localhost:5173`. API calls are proxied to the backend automatically.

## Claude Code Plugins

This project uses the [`frontend-design`](https://github.com/claude-plugins-official/frontend-design) plugin for generating polished UI components. Install it with:

```bash
/plugin install frontend-design@claude-plugins-official
```

## Agent Architecture

The AI layer lives in `src/agent/`:

```
src/agent/
├── README.md          # decisions and roadmap
├── tools.py           # tool definitions and execution (wraps existing services)
├── agent.py           # JSON tool loop: prompt → tool call → execute → answer
└── chat_service.py    # conversation history CRUD via Conversation model
```

The agent uses a simple tool loop (no LangGraph): the LLM responds with a JSON tool call, the server executes it against the existing services, and the result is fed back. The final answer is streamed to the client via SSE. See `src/agent/README.md` for the full decision log and roadmap.

### Chat endpoint

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chat` | Send a message; streams response via SSE |

**Request:**
```json
{ "message": "What's my net worth?", "thread_id": "<uuid or omit for new thread>" }
```

**SSE event stream:**
- First event: `thread_id` (persist this on the client for conversation continuity)
- Subsequent events: streamed answer tokens
- Final event: `[DONE]`

## API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Create a new account |
| `POST` | `/auth/login` | Log in and receive a JWT token |

**Signup request:**
```json
{ "email": "you@example.com", "name": "Your Name", "password": "secret" }
```

**Login response:**
```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

### Accounts

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/accounts` | List all accounts and net worth |
| `POST` | `/accounts` | Create a new account |

Account types: `checking`, `savings`, `credit`, `cash`. Default currency: `INR`.

**Create account request:**
```json
{ "name": "HDFC Savings", "type": "savings", "balance": 50000.0, "currency": "INR" }
```

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/transactions` | Record an income or expense |
| `POST` | `/transactions/transfer` | Transfer money between accounts |
| `GET` | `/transactions` | List transactions (filterable) |
| `GET` | `/transactions/summary/monthly` | Monthly income/expense summary |
| `GET` | `/transactions/summary/categories` | Spending breakdown by category |

**Record transaction:**
```json
{
  "account_id": "<id>",
  "amount": 1200.0,
  "type": "expense",
  "category": "Food",
  "description": "Groceries",
  "date": "2026-04-17T10:00:00Z"
}
```

**List transactions — query params:**
- `account_id` — filter by account
- `start_date` + `end_date` — filter by date range (ISO 8601)

**Monthly summary — query params:** `year`, `month`

**Category breakdown — query params:** `start_date`, `end_date`

## Running Tests

```bash
pytest
```

Watch mode (reruns on file changes):

```bash
.venv/bin/ptw --clear --runner "./run_tests.sh"
```
