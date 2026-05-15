from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


@lru_cache(maxsize=1)
def get_engine():
    settings = get_settings()
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is required for persistent database access.")
    return create_engine(
        normalize_database_url(settings.database_url),
        future=True,
        pool_pre_ping=True,
    )


SessionLocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    class_=Session,
    expire_on_commit=False,
)


def create_session() -> Session:
    return SessionLocal(bind=get_engine())
