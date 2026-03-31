# Implementation Log

---

## Project Setup

- [x] Initialise git repository
- [x] Create `client/` — React app (Vite)
- [x] Create `server/` — Node.js + Express API
- [x] Set up MongoDB connection via Mongoose
- [x] Configure `.env` for secrets (DB URI, API keys, port)
- [x] Set up `concurrently` for running client + server together (`npm run dev`)
- [x] Configure Tailwind CSS in client
- [x] Set up Claude API (Anthropic SDK) in server
- [x] Set up basic health check route (`GET /api/health`)
- [x] Deploy skeleton to production (Render / Railway + Vercel)
- [x] Set up environment variables in production

---

## Versions

---

### v0.1 — Foundation: Accounts & Transactions

> Goal: a user can connect their financial data and see it in one place.

- [x] User auth (signup, login, JWT)
- [ ] Manual account creation (bank, cash, credit card)
- [ ] CSV / statement upload for transaction import
- [ ] Basic transaction parser (amount, date, description from CSV)
- [ ] Store transactions in DB linked to account
- [ ] Transaction list view — clean, readable, no clutter
- [ ] Basic deduplication on import

---

### v0.2 — AI Understanding: Categorisation & Patterns

> Goal: Paisa understands what the transactions mean without the user configuring anything.

- [ ] Send transaction descriptions to Claude for auto-categorisation
- [ ] Category taxonomy defined (broad, not granular — 8–10 max)
- [ ] User can correct a category (one tap, no form)
- [ ] Detect recurring transactions (subscriptions, salary, rent)
- [ ] Identify merchants from raw bank descriptions
- [ ] Store enriched transaction data (category, merchant, is_recurring)

---

### v0.3 — Awareness: Know Where You Stand

> Goal: open Paisa and immediately know if you are okay this month — no reading required.

- [ ] Monthly spend summary computed server-side
- [ ] "Financial health" signal — a single, honest status (on track / watch out / take action)
- [ ] Signal logic: based on spend rate vs. month progress, not arbitrary limits
- [ ] Month-over-month comparison (plain language, not charts)
- [ ] Highlight unusual spends (outliers vs. personal baseline)
- [ ] Home screen built around the signal — not a dashboard, a status

---

### v0.4 — Conversation: Ask Paisa Anything

> Goal: the user can ask a natural language question and get a direct, honest answer.

- [ ] Chat interface on home screen — simple input, no modal
- [ ] Claude receives user question + relevant financial context (last 90 days)
- [ ] Answers are direct and specific — numbers, not advice
- [ ] Handle core questions: "how am I doing?", "what did I spend on X?", "can I afford Y?"
- [ ] Conversation is stateless per session (no memory yet)
- [ ] Graceful handling of questions Paisa can't answer

---

### v0.5 — Goals: Make Progress on What Matters

> Goal: saving toward something feels like real progress, not a number on a screen.

- [ ] User can create a goal (name, target amount, optional deadline)
- [ ] Goal progress computed from actual savings behaviour, not manual input
- [ ] Goal shown in context of current financial health — not a separate screen
- [ ] Paisa can answer "am I on track for my goal?" in conversation
- [ ] Adjust goal timeline based on real spend patterns
- [ ] Celebrate milestones — lightweight, not gamified

---

### v0.6 — Memory & Personalisation

> Goal: Paisa knows you well enough to give advice that fits your actual life.

- [ ] Persist conversation context across sessions
- [ ] Build user financial profile over time (income, fixed expenses, saving rate)
- [ ] Paisa references personal baseline in answers, not generic benchmarks
- [ ] Proactive nudges — only when genuinely useful, never noisy
- [ ] User can tell Paisa things: "I got a raise", "I'm trying to cut dining out"

---

### v1.0 — Reliable, Fast, Trusted

> Goal: the product works so consistently that the user never doubts it.

- [ ] Automated bank sync (via account aggregator or open banking API)
- [ ] Real-time transaction ingestion
- [ ] Data accuracy audit — compare imported vs. actual for test accounts
- [ ] Full offline support (PWA) with sync on reconnect
- [ ] Performance audit — home screen loads under 1s
- [ ] Security audit — data encryption at rest and in transit
- [ ] User data export (full, portable, no lock-in)
- [ ] Production monitoring and alerting

---

## Notes

- Every version must deliver a complete, usable outcome — not a partial feature waiting for the next version to make sense.
- If a version ships and a user can't feel the difference, it doesn't count.
- Resist adding to a version. When in doubt, push to the next one.
