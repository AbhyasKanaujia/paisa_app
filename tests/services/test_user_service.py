import pytest
from src.services import UserService


async def test_signup_creates_user():
    user = await UserService.signup("a@example.com", "A", "pass123")
    assert user.email == "a@example.com"
    assert user.password_hash != "pass123"


async def test_login_returns_token():
    await UserService.signup("b@example.com", "B", "pass123")
    token = await UserService.login("b@example.com", "pass123")
    assert isinstance(token, str)


async def test_login_wrong_password():
    await UserService.signup("c@example.com", "C", "pass123")
    with pytest.raises(ValueError, match="Invalid email or password"):
        await UserService.login("c@example.com", "wrong")


async def test_login_unknown_email():
    with pytest.raises(ValueError, match="Invalid email or password"):
        await UserService.login("ghost@example.com", "pass")


async def test_verify_token():
    await UserService.signup("d@example.com", "D", "pass123")
    token = await UserService.login("d@example.com", "pass123")
    payload = UserService.verify_token(token)
    assert payload["email"] == "d@example.com"
