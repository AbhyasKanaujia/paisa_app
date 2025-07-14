# 🧠 Paisa Backend

The backend API for **Paisa**, a radically fast, flow-based personal finance tracker designed for keyboard-first, no-click, high-speed data entry.

This backend powers:
- Smart input parsing and batch transaction logging
- Pinned context persistence
- User preferences and summaries
- Offline-friendly syncing

---

## 🚧 Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Server    | Node.js + Express             |
| Database  | MongoDB + Mongoose            |
| Validation| Zod (schema-first validation) |
| Auth      | (Planned) JWT / Magic Link    |

---

## 🧾 Core Entities (Mongoose Models)

| Model        | Description                                  |
|--------------|----------------------------------------------|
| `User`       | Stores user email, preferences, pinned state |
| `Transaction`| Core unit of logging: expense or income      |
| `Account`    | Where money flows from (cash, wallet, bank)  |
| `Tag`        | Categorization of spending                   |
| `Batch`      | Group of raw inputs + pinned context         |

Each model has full CRUD routes and is user-scoped.

---

## 📁 Directory Structure

```txt
backend/
├── controllers/        # Business logic for each model
├── models/             # Mongoose schemas
├── routes/             # Express routers
├── validators/         # Zod input validation middleware
├── app.js              # Express app entry point
├── config/             # DB connection, env vars (optional)
└── README.md           # This file
