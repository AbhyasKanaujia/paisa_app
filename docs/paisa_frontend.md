# 💸 Paisa App — Frontend

A radically fast, flow-based personal finance tracker.  
Built to keep you in flow — no clicks, no clutter, no friction.

## 🧠 Philosophy

Paisa reimagines personal finance tracking.  
Forget clunky forms and dropdowns. Inspired by **Vim**, **Typeform**, and **Raycast**, Paisa lets you log expenses as fast as you think.

- 🧭 One line. One entry. One flow.
- ⌨️ Keyboard-first. No mouse. No tabs.
- 🧠 Smart parsing. Natural language-style input.
- 📌 Pin recurring context (account, date, tags)
- 🗂 Batch entries. Paste multiple lines at once.
- ↔️ Arrow-key toggles for expense/income mode
- 🔁 Undo and edit recent entries instantly

## ✨ Example Usage

```

> 150 coffee @Starbucks from HDFC on Apr 10 #food
> pin from HDFC on Apr 10 #food
> 120 sandwich @Subway
> 200 tea @Chaayos
> < 10000 salary from Razorpay on Apr 7 #income

```

## ⚙️ Tech Stack

| Layer            | Tech                         |
|------------------|------------------------------|
| UI               | React + Tailwind + Framer Motion |
| Input Parser     | Custom (frontend + backend synced) |
| Keyboard UX      | `cmdk`, custom hooks         |
| Charts           | Recharts / Tremor            |
| Global State     | Zustand                      |
| Routing          | React Router v6              |
| Local-first UX   | Offline caching + sync queue |
| Animation        | Framer Motion                |

## 🗂 Folder Structure

```

src/
├── App.jsx                     # App wrapper — keyboard layer, providers
├── main.jsx                   # Entry point
├── pages/
│   └── Console.jsx            # The main and only screen ("/")
├── components/
│   ├── EntryBar.jsx           # Command input bar + parser preview
│   ├── PinnedContextBar.jsx   # Shows pinned account/date/tags
│   ├── RecentEntries.jsx      # Mini log of recent transactions
│   ├── InsightCard.jsx        # Inline summary widget
│   ├── UndoToast.jsx          # Undo feedback after entry
│   ├── SettingsModal.jsx      # Cmd+, to open preferences
│   ├── ContextEditorModal.jsx # Cmd+Shift+P to edit pinned context
│   ├── CommandHelp.jsx        # Cmd+/ to show command syntax
├── hooks/
│   ├── usePinnedContext.js
│   ├── useEntryParser.js
│   ├── useTransactionAPI.js
│   └── useKeyboardShortcuts.js
└── utils/
└── parser.js              # Live parser (mirrors backend rules)

````

## 🧪 User Interface Model

> **Everything happens inside `/` — the Command Console**

This is not a multi-page app. It's a modal-first, input-focused workspace.

### The Console includes:
- **Command Input** (`EntryBar`)
- **Parsed Preview** (inline below input)
- **Pinned Context** (`PinnedContextBar`)
- **Recent Entries** (`RecentEntries`)
- **Insights Widget** (`InsightCard`)
- **Undo feedback** (`UndoToast`)
- **Keyboard Modals**: Settings, Help, Context Editor

No tabbing. No routing. No interruptions. Just stay in the zone.

## 🧠 Keyboard UX

| Action                   | Shortcut            |
|--------------------------|---------------------|
| Toggle Entry Mode        | `→` (Expense), `←` (Income) |
| Pin Context              | `Cmd+Shift+P`       |
| Open Settings            | `Cmd+,`             |
| Show Command Help        | `Cmd+/`             |
| Undo Last Entry          | `Cmd+Z`             |
| Batch Paste              | Paste multi-line    |

## 🔧 Backend Interactions

| Feature               | Endpoint Used                        |
|-----------------------|---------------------------------------|
| Log transaction       | `POST /transactions`                 |
| Batch entry           | `POST /transactions/batch`           |
| Undo/delete entry     | `DELETE /transactions/:id`           |
| Edit transaction      | `PATCH /transactions/:id`            |
| Store pinned context  | `PATCH /user/:userId/preferences`    |
| Show recent entries   | `GET /transactions/user/:userId`     |

## 📁 Routing

This is a **single-view app**. Most features are state-driven, not route-driven.

| Route     | Purpose                         |
|-----------|----------------------------------|
| `/`       | Command Console (Main App)       |
| `/auth`   | (Optional) Login for cloud sync  |
| `/dev`    | (Optional) Debug account/tags    |

---

## 🚀 Running the Frontend

```bash
git clone https://github.com/AbhyasKanaujia/paisa_app.git
cd paisa-frontend
npm install
npm run dev
````

> The backend must be running separately (`paisa-backend`)

---

## 🙌 Contribute

Paisa is built for humans who value clarity, speed, and flow.
If you think in keystrokes and modal workflows, we’d love your ideas or contributions.
Open an issue or ping Abhyas.

---

## 📜 License

GPL-3.0-or-later

