from __future__ import annotations

from sqlalchemy import inspect

from app.db.init_db import init_db
from app.db.session import current_engine


def test_init_db_creates_tables() -> None:
    init_db()
    inspector = inspect(current_engine())
    table_names = inspector.get_table_names()
    assert "users" in table_names
    assert "communities" in table_names
    assert "posts" in table_names
