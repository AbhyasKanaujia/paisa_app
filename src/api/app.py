from __future__ import annotations
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import src.models.db as db_module
from src.api.routers import auth, accounts, transactions, chat


@asynccontextmanager
async def lifespan(app: FastAPI):  # pragma: no cover
    owned = False
    if db_module._client is None:
        db_module._client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
        owned = True
    yield
    if owned:
        db_module._client.close()
        db_module._client = None


def create_app() -> FastAPI:
    app = FastAPI(title="Paisa", version="0.1.0", lifespan=lifespan)
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
    app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
    app.include_router(chat.router, prefix="/chat", tags=["chat"])
    return app
