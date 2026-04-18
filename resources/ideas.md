# Ideas

## AI Assistant — Action Cards with UI Deep Links

After the agent performs an action (create account, record transaction, etc.), it shows an interactive card in the chat panel with a link that navigates the main panel to the relevant page and filter.

**Example flows:**
- Record a transaction → card shows the transaction details + link to `/transactions?month=2026-03` (filtered to that month)
- Create an account → card links to `/accounts/<id>` showing just that account

### Prerequisites

1. **React Router** — the app currently has no URL routing, just `page` state. All main views need real URLs with support for query params and path params.
2. **Transactions page** — needs to exist and accept filter params (by account, date range, month) via the URL.
3. **Summary page** — needs to exist with a linkable URL.
4. **Account detail page** — `/accounts/:id` showing a single account and its transactions.

### Implementation outline (once prerequisites are met)

- Tool responses return a `ui_hint` alongside the data: `{ data: ..., route: "/accounts/abc123" }`.
- The agent extracts the `ui_hint` and appends a structured card to the chat message alongside its prose response.
- Chat UI renders two message types: plain text and action cards (card shows a summary + a "View" button).
- Clicking "View" sets the React Router location to the card's route, updating the main panel.
- The LLM prompt is updated to instruct the model to emit cards only after mutating tool calls (create, record, transfer), not reads.
