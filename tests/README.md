# Tests

## Structure

Tests mirror the `src/` layout — a file in `src/foo/bar.py` has its tests in `tests/foo/test_bar.py`.

```
tests/
├── conftest.py          # shared fixtures (DB mock, etc.)
├── models/
│   ├── test_user.py
│   ├── test_account.py
│   └── test_transaction.py
├── services/            # (coming soon)
└── api/                 # (coming soon)
```

## Running tests

```bash
# All tests
.venv/bin/pytest

# Specific module
.venv/bin/pytest tests/models/

# Verbose + stop on first failure
.venv/bin/pytest -x -v
```

## Writing tests

- Each test file maps 1-to-1 with a source file.
- Use `async def test_...` — `asyncio_mode = "auto"` is configured in `pyproject.toml`.
- DB is mocked via `mongomock-motor` in `conftest.py` — no real DB needed to run tests.
- Fixtures shared across multiple test files go in `conftest.py`; fixtures used in only one file stay in that file.
