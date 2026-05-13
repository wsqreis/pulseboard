from app.db.base import Base
from app.db.session import current_engine


def init_db() -> None:
    Base.metadata.create_all(bind=current_engine())
