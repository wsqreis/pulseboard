from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.communities.service import CommunityService

DatabaseSession = Annotated[Session, Depends(get_db_session)]


def get_community_service(session: DatabaseSession) -> CommunityService:
    return CommunityService(session)


CommunityServiceDependency = Annotated[CommunityService, Depends(get_community_service)]
