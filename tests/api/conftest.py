import pytest
from httpx import AsyncClient, ASGITransport
from src.api.app import create_app


@pytest.fixture
async def client():
    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_headers(client):
    await client.post("/auth/signup", json={
        "email": "test@example.com", "name": "Test User", "password": "pass123"
    })
    resp = await client.post("/auth/login", json={
        "email": "test@example.com", "password": "pass123"
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def account_id(client, auth_headers):
    resp = await client.post("/accounts", json={
        "name": "Main Checking", "type": "checking", "balance": 5000.0
    }, headers=auth_headers)
    return resp.json()["id"]
