import pytest
import jwt
import datetime


async def test_signup_returns_201(client):
    resp = await client.post("/auth/signup", json={
        "email": "new@example.com", "name": "New User", "password": "secret"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "new@example.com"
    assert data["name"] == "New User"
    assert "id" in data
    assert "created_at" in data


async def test_login_returns_token(client):
    await client.post("/auth/signup", json={
        "email": "login@example.com", "name": "Login User", "password": "pass123"
    })
    resp = await client.post("/auth/login", json={
        "email": "login@example.com", "password": "pass123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


async def test_login_wrong_password_returns_401(client):
    await client.post("/auth/signup", json={
        "email": "wrong@example.com", "name": "Wrong", "password": "correct"
    })
    resp = await client.post("/auth/login", json={
        "email": "wrong@example.com", "password": "incorrect"
    })
    assert resp.status_code == 401


async def test_missing_auth_header_returns_401(client):
    resp = await client.get("/accounts")
    assert resp.status_code in (401, 403)


async def test_invalid_token_returns_401(client):
    resp = await client.get("/accounts", headers={"Authorization": "Bearer invalid.token.here"})
    assert resp.status_code == 401


async def test_expired_token_returns_401(client):
    expired_token = jwt.encode(
        {"sub": "000000000000000000000001", "email": "x@x.com",
         "exp": datetime.datetime(2000, 1, 1, tzinfo=datetime.timezone.utc)},
        "test-secret-key-that-is-long-enough-for-hs256",
        algorithm="HS256",
    )
    resp = await client.get("/accounts", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Token expired"


async def test_signup_failure_returns_400(client, monkeypatch):
    from src.services import user_service
    async def boom(email, name, password):
        raise Exception("DB error")
    monkeypatch.setattr(user_service.UserService, "signup", boom)
    resp = await client.post("/auth/signup", json={
        "email": "fail@example.com", "name": "Fail", "password": "pass"
    })
    assert resp.status_code == 400
