# Paisa App

## Environment Check

Before starting, run the diagnostic script to verify tools, env vars, and database connectivity are all wired up:

```bash
./scripts/check_env.sh
```

It checks `.env` values, required CLI tools (`mongosh`, `python3`, `node`), MongoDB ping, and project setup. Never crashes — just reports PASS / WARN / FAIL with suggestions. Add new checks there as the app grows.
