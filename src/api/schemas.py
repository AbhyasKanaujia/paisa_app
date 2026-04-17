from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str


class CreateAccountRequest(BaseModel):
    name: str
    type: Literal["checking", "savings", "credit", "cash"]
    balance: float = 0.0
    currency: str = "INR"


class AccountResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: str
    balance: float
    currency: str
    created_at: str


class AccountsListResponse(BaseModel):
    accounts: list[AccountResponse]
    net_worth: float


class RecordTransactionRequest(BaseModel):
    account_id: str
    amount: float
    type: Literal["income", "expense", "transfer"]
    category: str = ""
    description: str = ""
    date: datetime


class TransferRequest(BaseModel):
    from_account_id: str
    to_account_id: str
    amount: float
    date: datetime
    description: str = ""


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    account_id: str
    amount: float
    type: str
    category: str
    description: str
    date: str
    created_at: str


class TransferResponse(BaseModel):
    debit: TransactionResponse
    credit: TransactionResponse


class MonthlySummaryResponse(BaseModel):
    year: int
    month: int
    income: float
    expenses: float
    net: float
    transaction_count: int


class CategorySpendingItem(BaseModel):
    category: str
    total: float
    count: int


class CategorySpendingResponse(BaseModel):
    breakdown: list[CategorySpendingItem]
    start_date: str
    end_date: str
