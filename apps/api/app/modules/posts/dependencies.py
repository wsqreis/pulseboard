from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.posts.service import DiscussionService

DatabaseSession = Annotated[Session, Depends(get_db_session)]


def get_discussion_service(session: DatabaseSession) -> DiscussionService:
    return DiscussionService(session)


DiscussionServiceDependency = Annotated[DiscussionService, Depends(get_discussion_service)]
