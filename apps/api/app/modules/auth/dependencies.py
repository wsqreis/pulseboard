from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.session import get_db_session
from app.modules.auth.email import email_gateway
from app.modules.auth.schemas import RefreshTokenRequest
from app.modules.auth.security import decode_access_token, is_access_token_invalid
from app.modules.auth.service import AuthService, RequestContext
from app.modules.users.models import User

DatabaseSession = Annotated[Session, Depends(get_db_session)]
ConfiguredSettings = Annotated[Settings, Depends(get_settings)]


def get_request_context(request: Request) -> RequestContext:
    return RequestContext(
        ip_address=request.client.host if request.client is not None else None,
        user_agent=request.headers.get("user-agent"),
    )


def get_auth_service(session: DatabaseSession, settings: ConfiguredSettings) -> AuthService:
    return AuthService(session=session, settings=settings, email_gateway=email_gateway)


AuthServiceDependency = Annotated[AuthService, Depends(get_auth_service)]
RequestContextDependency = Annotated[RequestContext, Depends(get_request_context)]


def get_current_user(
    session: DatabaseSession,
    settings: ConfiguredSettings,
    authorization: str | None = Header(default=None),
) -> User:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing_token")
    token = authorization.removeprefix("Bearer ").strip()
    if is_access_token_invalid(token, settings):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_token")
    payload = decode_access_token(token, settings)
    user = session.get(User, payload.get("sub"))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_token")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def extract_refresh_token(payload: RefreshTokenRequest) -> str:
    return payload.refresh_token
