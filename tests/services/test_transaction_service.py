import pytest
from datetime import datetime, timezone
from src.models import User, Account, Transaction
from src.services import TransactionService


@pytest.fixture
async def user():
    return await User.create("svc@example.com", "Svc User")


@pytest.fixture
async def account(user):
    return await Account.create(user._id, "Checking", "checking", 1000.0)


async def test_record_expense_updates_balance(user, account):
    txn = await TransactionService.record(
        user._id, account._id, 200.0, "expense",
        datetime.now(timezone.utc), category="Food"
    )
    assert txn.amount == 200.0
    refreshed = await Account.find_by_id(account._id)
    assert refreshed.balance == 800.0


async def test_record_income_updates_balance(user, account):
    txn = await TransactionService.record(
        user._id, account._id, 500.0, "income",
        datetime.now(timezone.utc), category="Salary"
    )
    assert txn.amount == 500.0
    refreshed = await Account.find_by_id(account._id)
    assert refreshed.balance == 1500.0


async def test_record_invalid_account(user):
    from bson import ObjectId
    with pytest.raises(ValueError, match="not found"):
        await TransactionService.record(
            user._id, ObjectId(), 100.0, "expense", datetime.now(timezone.utc)
        )


async def test_transfer_updates_both_balances(user):
    source = await Account.create(user._id, "Checking", "checking", 1000.0)
    dest = await Account.create(user._id, "Savings", "savings", 200.0)

    debit, credit = await TransactionService.transfer(
        user._id, source._id, dest._id, 300.0, datetime.now(timezone.utc)
    )

    assert debit.type == "transfer"
    assert credit.type == "transfer"

    source_refreshed = await Account.find_by_id(source._id)
    dest_refreshed = await Account.find_by_id(dest._id)
    assert source_refreshed.balance == 700.0
    assert dest_refreshed.balance == 500.0


async def test_transfer_invalid_from_account(user):
    from bson import ObjectId
    dest = await Account.create(user._id, "Savings", "savings", 0.0)
    with pytest.raises(ValueError, match="not found"):
        await TransactionService.transfer(
            user._id, ObjectId(), dest._id, 100.0, datetime.now(timezone.utc)
        )


async def test_transfer_invalid_to_account(user):
    from bson import ObjectId
    source = await Account.create(user._id, "Checking", "checking", 500.0)
    with pytest.raises(ValueError, match="not found"):
        await TransactionService.transfer(
            user._id, source._id, ObjectId(), 100.0, datetime.now(timezone.utc)
        )


async def test_monthly_summary(user, account):
    date = datetime(2025, 3, 10, tzinfo=timezone.utc)
    await TransactionService.record(user._id, account._id, 3000.0, "income", date)
    await TransactionService.record(user._id, account._id, 500.0, "expense", date, category="Rent")
    await TransactionService.record(user._id, account._id, 100.0, "expense", date, category="Food")

    summary = await TransactionService.monthly_summary(user._id, 2025, 3)
    assert summary["income"] == 3000.0
    assert summary["expenses"] == 600.0
    assert summary["net"] == 2400.0
    assert summary["transaction_count"] == 3


async def test_monthly_summary_empty(user):
    summary = await TransactionService.monthly_summary(user._id, 2025, 1)
    assert summary["income"] == 0.0
    assert summary["expenses"] == 0.0
    assert summary["net"] == 0.0
    assert summary["transaction_count"] == 0


async def test_spending_by_category(user, account):
    date = datetime(2025, 3, 10, tzinfo=timezone.utc)
    await TransactionService.record(user._id, account._id, 400.0, "expense", date, category="Rent")
    await TransactionService.record(user._id, account._id, 100.0, "expense", date, category="Food")
    await TransactionService.record(user._id, account._id, 50.0, "expense", date, category="Food")
    await TransactionService.record(user._id, account._id, 3000.0, "income", date, category="Salary")

    from datetime import timedelta
    breakdown = await TransactionService.spending_by_category(
        user._id,
        date - timedelta(days=1),
        date + timedelta(days=1),
    )

    assert breakdown[0]["category"] == "Rent"
    assert breakdown[0]["total"] == 400.0
    assert breakdown[1]["category"] == "Food"
    assert breakdown[1]["total"] == 150.0
    assert breakdown[1]["count"] == 2
    assert all(b["category"] != "Salary" for b in breakdown)


async def test_spending_by_category_uncategorized(user, account):
    date = datetime(2025, 4, 5, tzinfo=timezone.utc)
    await TransactionService.record(user._id, account._id, 20.0, "expense", date)

    from datetime import timedelta
    breakdown = await TransactionService.spending_by_category(
        user._id, date - timedelta(days=1), date + timedelta(days=1)
    )
    assert breakdown[0]["category"] == "Uncategorized"
