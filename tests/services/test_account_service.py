import pytest
from src.models import User, Account
from src.services import AccountService


@pytest.fixture
async def user():
    return await User.create("acct_svc@example.com", "Acct Svc User")


async def test_net_worth_assets_only(user):
    await Account.create(user._id, "Checking", "checking", 1000.0)
    await Account.create(user._id, "Savings", "savings", 500.0)
    assert await AccountService.net_worth(user._id) == 1500.0


async def test_net_worth_credit_is_liability(user):
    await Account.create(user._id, "Checking", "checking", 2000.0)
    await Account.create(user._id, "Credit Card", "credit", 300.0)
    assert await AccountService.net_worth(user._id) == 1700.0


async def test_net_worth_no_accounts(user):
    assert await AccountService.net_worth(user._id) == 0.0


async def test_summary_returns_all_accounts(user):
    await Account.create(user._id, "Checking", "checking", 100.0)
    await Account.create(user._id, "Savings", "savings", 200.0)
    result = await AccountService.summary(user._id)
    assert len(result) == 2
    names = {a["name"] for a in result}
    assert names == {"Checking", "Savings"}


async def test_summary_empty(user):
    result = await AccountService.summary(user._id)
    assert result == []


async def test_add_account(user):
    account = await AccountService.add_account(user._id, "HDFC", "savings", 76425.82)
    assert account.name == "HDFC"
    assert account.type == "savings"
    assert account.balance == 76425.82
    assert account.currency == "INR"
