import pytest


async def test_record_transaction_returns_201(client, auth_headers, account_id):
    resp = await client.post("/transactions", json={
        "account_id": account_id,
        "amount": 500.0,
        "type": "expense",
        "category": "Food",
        "description": "Lunch",
        "date": "2026-04-01T12:00:00Z",
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["amount"] == 500.0
    assert data["type"] == "expense"
    assert data["category"] == "Food"


async def test_record_transaction_invalid_account_returns_404(client, auth_headers):
    resp = await client.post("/transactions", json={
        "account_id": "000000000000000000000001",
        "amount": 100.0,
        "type": "income",
        "date": "2026-04-01T12:00:00Z",
    }, headers=auth_headers)
    assert resp.status_code == 404


async def test_transfer_returns_debit_and_credit(client, auth_headers):
    acc1 = (await client.post("/accounts", json={"name": "From", "type": "checking", "balance": 1000.0}, headers=auth_headers)).json()["id"]
    acc2 = (await client.post("/accounts", json={"name": "To", "type": "savings", "balance": 0.0}, headers=auth_headers)).json()["id"]

    resp = await client.post("/transactions/transfer", json={
        "from_account_id": acc1,
        "to_account_id": acc2,
        "amount": 300.0,
        "date": "2026-04-01T12:00:00Z",
        "description": "Monthly savings",
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert "debit" in data and "credit" in data
    assert data["debit"]["amount"] == 300.0
    assert data["credit"]["amount"] == 300.0


async def test_list_transactions(client, auth_headers, account_id):
    await client.post("/transactions", json={
        "account_id": account_id, "amount": 100.0, "type": "income", "date": "2026-04-01T12:00:00Z"
    }, headers=auth_headers)
    resp = await client.get("/transactions", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


async def test_list_transactions_by_account(client, auth_headers, account_id):
    resp = await client.get(f"/transactions?account_id={account_id}", headers=auth_headers)
    assert resp.status_code == 200


async def test_list_transactions_by_date_range(client, auth_headers, account_id):
    resp = await client.get(
        "/transactions?start_date=2026-04-01T00:00:00Z&end_date=2026-04-30T23:59:59Z",
        headers=auth_headers
    )
    assert resp.status_code == 200


async def test_monthly_summary(client, auth_headers, account_id):
    await client.post("/transactions", json={
        "account_id": account_id, "amount": 2000.0, "type": "income",
        "category": "Salary", "date": "2026-04-10T12:00:00Z"
    }, headers=auth_headers)
    await client.post("/transactions", json={
        "account_id": account_id, "amount": 500.0, "type": "expense",
        "category": "Food", "date": "2026-04-15T12:00:00Z"
    }, headers=auth_headers)

    resp = await client.get("/transactions/summary/monthly?year=2026&month=4", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["income"] == 2000.0
    assert data["expenses"] == 500.0
    assert data["net"] == 1500.0
    assert data["transaction_count"] == 2


async def test_transfer_invalid_account_returns_404(client, auth_headers, account_id):
    resp = await client.post("/transactions/transfer", json={
        "from_account_id": account_id,
        "to_account_id": "000000000000000000000001",
        "amount": 100.0,
        "date": "2026-04-01T12:00:00Z",
    }, headers=auth_headers)
    assert resp.status_code == 404


async def test_spending_by_category(client, auth_headers, account_id):
    await client.post("/transactions", json={
        "account_id": account_id, "amount": 300.0, "type": "expense",
        "category": "Food", "date": "2026-04-10T12:00:00Z"
    }, headers=auth_headers)
    await client.post("/transactions", json={
        "account_id": account_id, "amount": 100.0, "type": "expense",
        "category": "Transport", "date": "2026-04-12T12:00:00Z"
    }, headers=auth_headers)

    resp = await client.get(
        "/transactions/summary/categories?start_date=2026-04-01T00:00:00Z&end_date=2026-04-30T23:59:59Z",
        headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "breakdown" in data
    assert data["breakdown"][0]["category"] == "Food"
    assert data["breakdown"][0]["total"] == 300.0
