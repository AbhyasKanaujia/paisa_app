from __future__ import annotations
from datetime import datetime, timezone
from calendar import monthrange
from src.models import Account, Transaction


class TransactionService:

    @staticmethod
    async def record(
        user_id,
        account_id,
        amount: float,
        type: str,
        date: datetime,
        category: str = "",
        description: str = "",
    ) -> Transaction:
        """Create a transaction and adjust the account balance."""
        account = await Account.find_by_id(account_id)
        if account is None:
            raise ValueError(f"Account {account_id} not found")

        delta = amount if type == "income" else -amount
        await account.update_balance(delta)

        return await Transaction.create(
            user_id, account_id, amount, type, date,
            category=category, description=description,
        )

    @staticmethod
    async def transfer(
        user_id,
        from_account_id,
        to_account_id,
        amount: float,
        date: datetime,
        description: str = "",
    ) -> tuple[Transaction, Transaction]:
        """Debit one account and credit another, creating two linked transactions."""
        from_account = await Account.find_by_id(from_account_id)
        to_account = await Account.find_by_id(to_account_id)

        if from_account is None:
            raise ValueError(f"Account {from_account_id} not found")
        if to_account is None:
            raise ValueError(f"Account {to_account_id} not found")

        await from_account.update_balance(-amount)
        await to_account.update_balance(amount)

        note = f"Transfer: {description}" if description else "Transfer"
        debit = await Transaction.create(
            user_id, from_account_id, amount, "transfer", date, description=note
        )
        credit = await Transaction.create(
            user_id, to_account_id, amount, "transfer", date, description=note
        )
        return debit, credit

    @staticmethod
    async def monthly_summary(user_id, year: int, month: int) -> dict:
        """Return total income, expenses, and net for a calendar month."""
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        last_day = monthrange(year, month)[1]
        end = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)

        transactions = await Transaction.find_by_date_range(user_id, start, end)

        income = sum(t.amount for t in transactions if t.type == "income")
        expenses = sum(t.amount for t in transactions if t.type == "expense")

        return {
            "year": year,
            "month": month,
            "income": income,
            "expenses": expenses,
            "net": income - expenses,
            "transaction_count": len(transactions),
        }

    @staticmethod
    async def spending_by_category(
        user_id, start: datetime, end: datetime
    ) -> list[dict]:
        """Return expense totals grouped by category, sorted by total descending."""
        transactions = await Transaction.find_by_date_range(user_id, start, end)

        totals: dict[str, dict] = {}
        for t in transactions:
            if t.type != "expense":
                continue
            key = t.category or "Uncategorized"
            if key not in totals:
                totals[key] = {"category": key, "total": 0.0, "count": 0}
            totals[key]["total"] += t.amount
            totals[key]["count"] += 1

        return sorted(totals.values(), key=lambda x: x["total"], reverse=True)
