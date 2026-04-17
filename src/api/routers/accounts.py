from fastapi import APIRouter, Depends, status
from src.api.deps import get_current_user
from src.api.schemas import CreateAccountRequest, AccountResponse, AccountsListResponse
from src.services.account_service import AccountService

router = APIRouter()


@router.get("", response_model=AccountsListResponse)
async def list_accounts(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    accounts = await AccountService.summary(user_id)
    net_worth = await AccountService.net_worth(user_id)
    return {"accounts": accounts, "net_worth": net_worth}


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    body: CreateAccountRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["sub"]
    account = await AccountService.add_account(
        user_id, body.name, body.type, body.balance, body.currency
    )
    return account.to_dict()
