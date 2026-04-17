from __future__ import annotations
from src.models import Account
from src.models.account import AccountType

LIABILITY_TYPES = {"credit"}


class AccountService:

    @staticmethod
    async def net_worth(user_id) -> float:
        """Sum all account balances; credit accounts are liabilities (subtracted)."""
        accounts = await Account.find_by_user(user_id)
        total = 0.0
        for account in accounts:
            if account.type in LIABILITY_TYPES:
                total -= account.balance
            else:
                total += account.balance
        return total

    @staticmethod
    async def add_account(
        user_id,
        name: str,
        type: AccountType,
        balance: float = 0.0,
        currency: str = "INR",
    ) -> Account:
        return await Account.create(user_id, name, type, balance, currency)

    @staticmethod
    async def summary(user_id) -> list[dict]:
        """Return all accounts with their current balances."""
        accounts = await Account.find_by_user(user_id)
        return [a.to_dict() for a in accounts]
