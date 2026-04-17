from fastapi import APIRouter, HTTPException, status
from src.api.schemas import SignupRequest, LoginRequest, TokenResponse, UserResponse
from src.services.user_service import UserService

router = APIRouter()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    try:
        user = await UserService.signup(body.email, body.name, body.password)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return user.to_dict()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    try:
        token = await UserService.login(body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return {"access_token": token, "token_type": "bearer"}
