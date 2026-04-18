from __future__ import annotations
from datetime import datetime, timezone
from src.services.account_service import AccountService
from src.services.transaction_service import TransactionService

# Tool schemas sent to the LLM in the system prompt
TOOL_SCHEMAS = [
    {
        "name": "get_accounts",
        "description": "List all of the user's accounts with current balances.",
        "parameters": {},
    },
    {
        "name": "get_net_worth",
        "description": "Return the user's net worth (assets minus credit liabilities).",
        "parameters": {},
    },
    {
        "name": "get_transactions",
        "description": "Get recent transactions for the user, optionally filtered by account id.",
        "parameters": {
            "account_id": {"type": "string", "description": "Optional account id to filter by"},
            "limit": {"type": "integer", "description": "Max number of transactions to return (default 20)"},
        },
    },
    {
        "name": "get_monthly_summary",
        "description": "Get income, expenses, and net for a specific calendar month.",
        "parameters": {
            "year": {"type": "integer", "description": "Year (e.g. 2026)"},
            "month": {"type": "integer", "description": "Month number 1-12"},
        },
    },
    {
        "name": "get_spending_by_category",
        "description": "Get expense breakdown by category for a date range.",
        "parameters": {
            "start_date": {"type": "string", "description": "ISO date string YYYY-MM-DD"},
            "end_date": {"type": "string", "description": "ISO date string YYYY-MM-DD"},
        },
    },
    {
        "name": "record_transaction",
        "description": "Record an income or expense transaction and update the account balance.",
        "parameters": {
            "account_id": {"type": "string", "description": "Account id to record against"},
            "amount": {"type": "number", "description": "Positive amount"},
            "type": {"type": "string", "description": "Either 'income' or 'expense'"},
            "category": {"type": "string", "description": "Category label"},
            "description": {"type": "string", "description": "Optional note"},
            "date": {"type": "string", "description": "ISO date string YYYY-MM-DD, defaults to today"},
        },
    },
    {
        "name": "create_account",
        "description": "Create a new account for the user.",
        "parameters": {
            "name": {"type": "string", "description": "Account name (e.g. 'HDFC Savings')"},
            "type": {"type": "string", "description": "Account type: 'checking', 'savings', 'credit', or 'cash'"},
            "balance": {"type": "number", "description": "Initial balance (default 0)"},
            "currency": {"type": "string", "description": "Currency code (default 'INR')"},
        },
    },
    {
        "name": "transfer",
        "description": "Transfer funds between two accounts.",
        "parameters": {
            "from_account_id": {"type": "string", "description": "Source account id"},
            "to_account_id": {"type": "string", "description": "Destination account id"},
            "amount": {"type": "number", "description": "Positive amount to transfer"},
            "description": {"type": "string", "description": "Optional note"},
            "date": {"type": "string", "description": "ISO date string YYYY-MM-DD, defaults to today"},
        },
    },
]


async def execute_tool(name: str, args: dict, user_id: str) -> str:
    """Execute a named tool and return a string result for the LLM."""
    try:
        if name == "get_accounts":
            accounts = await AccountService.summary(user_id)
            return str(accounts)

        elif name == "get_net_worth":
            net = await AccountService.net_worth(user_id)
            return f"Net worth: {net}"

        elif name == "get_transactions":
            account_id = args.get("account_id")
            limit = int(args.get("limit", 20))
            from src.models.transaction import Transaction
            if account_id:
                txns = await Transaction.find_by_account(account_id)
            else:
                txns = await Transaction.find_by_user(user_id)
            return str([t.to_dict() for t in txns[:limit]])

        elif name == "get_monthly_summary":
            year = int(args["year"])
            month = int(args["month"])
            result = await TransactionService.monthly_summary(user_id, year, month)
            return str(result)

        elif name == "get_spending_by_category":
            start = datetime.fromisoformat(args["start_date"]).replace(tzinfo=timezone.utc)
            end = datetime.fromisoformat(args["end_date"]).replace(tzinfo=timezone.utc)
            result = await TransactionService.spending_by_category(user_id, start, end)
            return str(result)

        elif name == "record_transaction":
            date_str = args.get("date")
            date = datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc) if date_str else datetime.now(timezone.utc)
            txn = await TransactionService.record(
                user_id=user_id,
                account_id=args["account_id"],
                amount=float(args["amount"]),
                type=args["type"],
                date=date,
                category=args.get("category", ""),
                description=args.get("description", ""),
            )
            return f"Recorded: {txn.to_dict()}"

        elif name == "create_account":
            from src.models.account import AccountType
            account = await AccountService.add_account(
                user_id=user_id,
                name=args["name"],
                type=args["type"],
                balance=float(args.get("balance", 0)),
                currency=args.get("currency", "INR"),
            )
            return f"Created account: {account.to_dict()}"

        elif name == "transfer":
            date_str = args.get("date")
            date = datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc) if date_str else datetime.now(timezone.utc)
            debit, credit = await TransactionService.transfer(
                user_id=user_id,
                from_account_id=args["from_account_id"],
                to_account_id=args["to_account_id"],
                amount=float(args["amount"]),
                date=date,
                description=args.get("description", ""),
            )
            return f"Transfer complete. Debit: {debit.to_dict()}, Credit: {credit.to_dict()}"

        else:
            return f"Unknown tool: {name}"

    except Exception as e:
        return f"Tool error: {e}"
