# Paisa App

## Setup

```bash
./scripts/check_env.sh           # verify env, tools, DB connectivity
python3 -m venv .venv && .venv/bin/pip install -e .
```

See [README.md](README.md) for full setup, schema details, and architecture.

## Daily Commands

- `./scripts/mongo` — MongoDB shell (auto-sources `.env`)
- `./scripts/check_env.sh` — health check

## Key Rules

- `schemas/*.json` is the source of truth for DB structure.
- `src/services/` are the only files that touch the database.
- To add a required env var, add it to the `REQUIRED_VARS` array in `scripts/check_env.sh`.
