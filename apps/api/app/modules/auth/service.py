from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.time import ensure_utc, utc_now
from app.modules.auth.email import DevEmailGateway
from app.modules.auth.models import EmailVerificationToken, PasswordResetToken, SessionToken
from app.modules.auth.schemas import AuthResponse, AuthTokens, UserResponse
from app.modules.auth.security import (
    build_one_time_token,
    build_refresh_token,
    create_access_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.modules.users.models import User, UserStatus


@dataclass
class RequestContext:
    ip_address: str | None
    user_agent: str | None


class AuthService:
    def __init__(
        self,
        session: Session,
        settings: Settings,
        email_gateway: DevEmailGateway,
    ) -> None:
        self.session = session
        self.settings = settings
        self.email_gateway = email_gateway

    def register(
        self,
        email: str,
        password: str,
        display_name: str,
        context: RequestContext,
    ) -> AuthResponse:
        existing_user = self.session.scalar(select(User).where(User.email == email.lower()))
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="email_already_used",
            )

        user = User(
            email=email.lower(),
            password_hash=hash_password(password),
            display_name=display_name,
            status=UserStatus.pending,
        )
        self.session.add(user)
        self.session.flush()
        self._issue_email_verification(user)
        auth_response = self._create_session_response(user, context)
        self.session.commit()
        self.session.refresh(user)
        return auth_response

    def login(
        self,
        email: str,
        password: str,
        context: RequestContext,
    ) -> AuthResponse:
        user = self.session.scalar(select(User).where(User.email == email.lower()))
        if user is None or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="invalid_credentials",
            )
        if user.email_verified_at is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="email_not_verified",
            )
        auth_response = self._create_session_response(user, context)
        self.session.commit()
        return auth_response

    def refresh(self, refresh_token: str, context: RequestContext) -> AuthResponse:
        hashed_token = hash_token(refresh_token)
        session_token = self.session.scalar(
            select(SessionToken).where(SessionToken.refresh_token_hash == hashed_token)
        )
        if session_token is None or session_token.revoked_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="invalid_refresh_token",
            )
        if ensure_utc(session_token.expires_at) <= utc_now():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="expired_refresh_token",
            )

        user = self.session.get(User, session_token.user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="invalid_refresh_token",
            )

        session_token.revoked_at = utc_now()
        auth_response = self._create_session_response(user, context)
        self.session.commit()
        return auth_response

    def logout(self, refresh_token: str) -> None:
        hashed_token = hash_token(refresh_token)
        session_token = self.session.scalar(
            select(SessionToken).where(SessionToken.refresh_token_hash == hashed_token)
        )
        if session_token is not None and session_token.revoked_at is None:
            session_token.revoked_at = utc_now()
            self.session.commit()

    def verify_email(self, token: str) -> None:
        token_record = self.session.scalar(
            select(EmailVerificationToken).where(
                EmailVerificationToken.token_hash == hash_token(token)
            )
        )
        if token_record is None or token_record.used_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invalid_token",
            )
        if ensure_utc(token_record.expires_at) <= utc_now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="expired_token",
            )

        user = self.session.get(User, token_record.user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invalid_token",
            )

        now = utc_now()
        user.email_verified_at = now
        user.status = UserStatus.active
        token_record.used_at = now
        self.session.commit()

    def resend_verification(self, email: str) -> None:
        user = self.session.scalar(select(User).where(User.email == email.lower()))
        if user is None or user.email_verified_at is not None:
            return
        self._issue_email_verification(user)
        self.session.commit()

    def forgot_password(self, email: str) -> None:
        user = self.session.scalar(select(User).where(User.email == email.lower()))
        if user is None:
            return
        raw_token = build_one_time_token()
        token = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=utc_now()
            + timedelta(minutes=self.settings.password_reset_token_ttl_minutes),
        )
        self.session.add(token)
        self.email_gateway.send(
            to=user.email,
            subject="Reset your password",
            body=f"{self.settings.app_base_url}/reset-password?token={raw_token}",
        )
        self.session.commit()

    def reset_password(self, token: str, new_password: str) -> None:
        token_record = self.session.scalar(
            select(PasswordResetToken).where(
                PasswordResetToken.token_hash == hash_token(token)
            )
        )
        if token_record is None or token_record.used_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invalid_token",
            )
        if ensure_utc(token_record.expires_at) <= utc_now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="expired_token",
            )

        user = self.session.get(User, token_record.user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invalid_token",
            )

        user.password_hash = hash_password(new_password)
        token_record.used_at = utc_now()
        self.session.execute(delete(SessionToken).where(SessionToken.user_id == user.id))
        self.session.commit()

    def change_password(
        self,
        user: User,
        current_password: str,
        new_password: str,
    ) -> None:
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invalid_password",
            )
        user.password_hash = hash_password(new_password)
        self.session.execute(delete(SessionToken).where(SessionToken.user_id == user.id))
        self.session.commit()

    def current_user_response(self, user: User) -> UserResponse:
        return UserResponse.from_user(user)

    def _issue_email_verification(self, user: User) -> None:
        raw_token = build_one_time_token()
        token = EmailVerificationToken(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=utc_now()
            + timedelta(hours=self.settings.email_token_ttl_hours),
        )
        self.session.add(token)
        self.email_gateway.send(
            to=user.email,
            subject="Verify your email",
            body=f"{self.settings.app_base_url}/verify-email?token={raw_token}",
        )

    def _create_session_response(
        self,
        user: User,
        context: RequestContext,
    ) -> AuthResponse:
        refresh_token = build_refresh_token()
        session_token = SessionToken(
            user_id=user.id,
            refresh_token_hash=hash_token(refresh_token),
            expires_at=utc_now()
            + timedelta(days=self.settings.jwt_refresh_token_ttl_days),
            ip_address=context.ip_address,
            user_agent=context.user_agent,
        )
        self.session.add(session_token)
        access_token = create_access_token(user.id, self.settings)
        return AuthResponse(
            user=UserResponse.from_user(user),
            tokens=AuthTokens(access_token=access_token, refresh_token=refresh_token),
        )
