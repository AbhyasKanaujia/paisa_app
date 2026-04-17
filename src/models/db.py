from motor.motor_asyncio import AsyncIOMotorClient
import os

_client: AsyncIOMotorClient | None = None


def get_db():
    global _client
    if _client is None:  # pragma: no cover
        _client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
    return _client[os.environ["MONGODB_DATABASE"]]
