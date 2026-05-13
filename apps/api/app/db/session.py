from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


@lru_cache(maxsize=8)
def get_engine(database_url: str) -> Engine:
    return create_engine(database_url, future=True)


def current_engine() -> Engine:
    return get_engine(get_settings().database_url)


def get_db_session() -> Generator[Session, None, None]:
    session_factory = sessionmaker(
        bind=current_engine(), autoflush=False, autocommit=False, class_=Session
    )
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
