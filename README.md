# Paisa App

Personal finance tracking app — FastAPI backend + MongoDB Atlas.

## Quick Start

```bash
# 1. Get .env from a teammate (contains MONGODB_URI)

# 2. Check your environment
./scripts/check_env.sh

# 3. Install Python dependencies
python3 -m venv .venv
.venv/bin/pip install -e .

# 4. Apply schemas (WARNING: drops existing collections)
./scripts/mongo --eval "
  db.accounts.drop();
  db.transactions.drop();
  db.createCollection('accounts', { validator: $(cat schemas/accounts.json) });
  db.createCollection('transactions', { validator: $(cat schemas/transactions.json) });
"
```

## Everyday Commands

```bash
./scripts/check_env.sh           # verify everything is healthy
./scripts/mongo                  # open MongoDB shell
./scripts/mongo --eval "..."     # run a query
```

## Schema

`schemas/*.json` is the single source of truth for the database structure — standard MongoDB JSON Schema files, language-agnostic, usable directly by `mongosh`.

- **accounts** — where money is (name, type, balance)
- **transactions** — money movement (account_id, amount, direction, date, category, note)

Account balance = sum of all its transactions.

## Architecture

```
src/
├── models/       # Pydantic models mirror schemas/*.json
├── services/     # Database read/write logic (only place that touches DB)
└── api/          # FastAPI routes
```

## Adding a Required Env Var

Edit `scripts/check_env.sh` and add an entry to the `REQUIRED_VARS` array:
```bash
"NEW_VAR|Description of what this is and what to ask the user"
```
