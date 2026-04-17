import pytest
from mongomock_motor import AsyncMongoMockClient
import src.models.db as db_module


@pytest.fixture(autouse=True)
def mock_db(monkeypatch):
    client = AsyncMongoMockClient()
    monkeypatch.setattr(db_module, "_client", client)
    monkeypatch.setenv("MONGODB_DATABASE", "test_paisa")
    monkeypatch.setenv("JWT_SECRET", "test-secret-key-that-is-long-enough-for-hs256")
    yield
    client.close()
