import pytest
from src.models import User


async def test_create_user():
    user = await User.create("abhyas@example.com", "Abhyas")
    assert user.email == "abhyas@example.com"
    assert user.name == "Abhyas"
    assert user._id is not None


async def test_find_by_email():
    await User.create("find@example.com", "Find Me")
    user = await User.find_by_email("find@example.com")
    assert user is not None
    assert user.name == "Find Me"


async def test_find_by_email_missing():
    user = await User.find_by_email("ghost@example.com")
    assert user is None


async def test_find_by_id():
    created = await User.create("byid@example.com", "By ID")
    found = await User.find_by_id(created._id)
    assert found is not None
    assert found.email == "byid@example.com"


async def test_to_dict():
    user = await User.create("dict@example.com", "Dict User")
    d = user.to_dict()
    assert d["email"] == "dict@example.com"
    assert "id" in d
    assert "created_at" in d


async def test_delete_cascades():
    from src.models import Account, Transaction
    from datetime import datetime, timezone

    user = await User.create("cascade@example.com", "Cascade")
    account = await Account.create(user._id, "Checking", "checking")
    await Transaction.create(
        user._id, account._id, 100.0, "income", datetime.now(timezone.utc)
    )

    await user.delete()

    assert await User.find_by_id(user._id) is None
    assert await Account.find_by_id(account._id) is None
    txns = await Transaction.find_by_user(user._id)
    assert txns == []
