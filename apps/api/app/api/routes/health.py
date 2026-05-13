from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db_session

router = APIRouter()
DBSession = Annotated[Session, Depends(get_db_session)]


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def readiness_check(session: DBSession) -> dict[str, str]:
    session.execute(text("SELECT 1"))
    return {"status": "ok"}
