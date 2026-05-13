from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.modules.auth.email import email_gateway

TEST_DATABASE_URL = "sqlite+pysqlite:///" + str(Path(__file__).parent / "test.db")
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)


@pytest.fixture(autouse=True)
def reset_database() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    email_gateway.outbox.clear()
    yield


@pytest.fixture(autouse=True)
def override_settings() -> Generator[None, None, None]:
    settings = get_settings()
    original_database_url = settings.database_url
    settings.database_url = TEST_DATABASE_URL
    yield
    settings.database_url = original_database_url


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    def override_db_session() -> Generator[Session, None, None]:
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db_session] = override_db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
