import pytest


async def test_create_account_returns_201(client, auth_headers):
    resp = await client.post("/accounts", json={
        "name": "Savings", "type": "savings", "balance": 10000.0, "currency": "INR"
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Savings"
    assert data["type"] == "savings"
    assert data["balance"] == 10000.0
    assert data["currency"] == "INR"
    assert "id" in data


async def test_create_account_defaults(client, auth_headers):
    resp = await client.post("/accounts", json={
        "name": "Cash", "type": "cash"
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["balance"] == 0.0
    assert data["currency"] == "INR"


async def test_list_accounts_includes_net_worth(client, auth_headers):
    await client.post("/accounts", json={"name": "Checking", "type": "checking", "balance": 1000.0}, headers=auth_headers)
    await client.post("/accounts", json={"name": "Credit", "type": "credit", "balance": 200.0}, headers=auth_headers)
    resp = await client.get("/accounts", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "accounts" in data
    assert "net_worth" in data
    assert len(data["accounts"]) == 2
    assert data["net_worth"] == 800.0  # 1000 - 200 (credit is liability)


async def test_list_accounts_empty(client, auth_headers):
    resp = await client.get("/accounts", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["accounts"] == []
    assert data["net_worth"] == 0.0
