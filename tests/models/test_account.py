import pytest
from src.models import User, Account, Transaction
from datetime import datetime, timezone


@pytest.fixture
async def user():
    return await User.create("acct@example.com", "Acct User")


async def test_create_account(user):
    account = await Account.create(user._id, "Savings", "savings", 500.0)
    assert account.name == "Savings"
    assert account.balance == 500.0
    assert account.type == "savings"
    assert account.user_id == user._id


async def test_find_by_user(user):
    await Account.create(user._id, "Checking", "checking")
    await Account.create(user._id, "Cash", "cash")
    accounts = await Account.find_by_user(user._id)
    assert len(accounts) == 2


async def test_find_by_id(user):
    created = await Account.create(user._id, "Credit", "credit")
    found = await Account.find_by_id(created._id)
    assert found is not None
    assert found.name == "Credit"


async def test_update_balance(user):
    account = await Account.create(user._id, "Checking", "checking", 100.0)
    await account.update_balance(50.0)
    assert account.balance == 150.0

    refreshed = await Account.find_by_id(account._id)
    assert refreshed.balance == 150.0


async def test_delete_cascades_transactions(user):
    account = await Account.create(user._id, "ToDelete", "checking")
    await Transaction.create(
        user._id, account._id, 200.0, "expense", datetime.now(timezone.utc)
    )

    await account.delete()

    assert await Account.find_by_id(account._id) is None
    txns = await Transaction.find_by_account(account._id)
    assert txns == []


async def test_to_dict(user):
    account = await Account.create(user._id, "Checking", "checking", 0.0, "INR")
    d = account.to_dict()
    assert d["currency"] == "INR"
    assert d["user_id"] == str(user._id)
