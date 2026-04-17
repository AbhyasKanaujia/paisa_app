from __future__ import annotations
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from src.api.deps import get_current_user
from src.api.schemas import (
    RecordTransactionRequest,
    TransferRequest,
    TransactionResponse,
    TransferResponse,
    MonthlySummaryResponse,
    CategorySpendingResponse,
)
from src.services.transaction_service import TransactionService
from src.models.transaction import Transaction

router = APIRouter()


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def record_transaction(
    body: RecordTransactionRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        txn = await TransactionService.record(
            current_user["sub"], body.account_id, body.amount,
            body.type, body.date, body.category, body.description,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return txn.to_dict()


@router.post("/transfer", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
async def transfer(
    body: TransferRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        debit, credit = await TransactionService.transfer(
            current_user["sub"], body.from_account_id, body.to_account_id,
            body.amount, body.date, body.description,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return {"debit": debit.to_dict(), "credit": credit.to_dict()}


@router.get("/summary/monthly", response_model=MonthlySummaryResponse)
async def monthly_summary(
    current_user: dict = Depends(get_current_user),
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
):
    return await TransactionService.monthly_summary(current_user["sub"], year, month)


@router.get("/summary/categories", response_model=CategorySpendingResponse)
async def spending_by_category(
    current_user: dict = Depends(get_current_user),
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
):
    breakdown = await TransactionService.spending_by_category(
        current_user["sub"], start_date, end_date
    )
    return {
        "breakdown": breakdown,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
    }


@router.get("", response_model=list[TransactionResponse])
async def list_transactions(
    current_user: dict = Depends(get_current_user),
    account_id: Optional[str] = Query(default=None),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
):
    user_id = current_user["sub"]
    if start_date and end_date:
        txns = await Transaction.find_by_date_range(user_id, start_date, end_date)
    elif account_id:
        txns = await Transaction.find_by_account(account_id)
    else:
        txns = await Transaction.find_by_user(user_id)
    return [t.to_dict() for t in txns]
