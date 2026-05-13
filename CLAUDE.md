# Paisa App

## Environment Check

Before starting, run the diagnostic script to verify tools, env vars, and database connectivity are all wired up:

```bash
./scripts/check_env.sh
```

It checks `.env` values, required CLI tools (`mongosh`, `python3`), MongoDB ping, and project setup. Never crashes — just reports PASS / WARN / FAIL with suggestions. Add new checks there as the app grows.

## Schema

`schemas/*.json` is the single source of truth for the database structure. These are standard MongoDB JSON Schema files — language-agnostic and directly usable by `mongosh`.

Use `./scripts/mongo` as a shortcut for `mongosh` (it sources `.env` and passes the URI for you):
```bash
./scripts/mongo                  # interactive shell
./scripts/mongo --eval "..."     # run a command
```

Apply schemas to the database:
```bash
./scripts/mongo --eval "
  db.accounts.drop();
  db.transactions.drop();
  db.createCollection('accounts', { validator: $(cat schemas/accounts.json) });
  db.createCollection('transactions', { validator: $(cat schemas/transactions.json) });
"
```
