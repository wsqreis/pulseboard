from __future__ import annotations

from fastapi import APIRouter, status

from app.modules.auth.dependencies import (
    AuthServiceDependency,
    CurrentUser,
    RequestContextDependency,
)
from app.modules.auth.schemas import (
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    UserResponse,
    VerifyEmailRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    auth_service: AuthServiceDependency,
    context: RequestContextDependency,
) -> AuthResponse:
    return auth_service.register(payload.email, payload.password, payload.display_name, context)


@router.post("/login")
def login(
    payload: LoginRequest,
    auth_service: AuthServiceDependency,
    context: RequestContextDependency,
) -> AuthResponse:
    return auth_service.login(payload.email, payload.password, context)


@router.post("/refresh")
def refresh(
    payload: RefreshTokenRequest,
    auth_service: AuthServiceDependency,
    context: RequestContextDependency,
) -> AuthResponse:
    return auth_service.refresh(payload.refresh_token, context)


@router.post("/logout", response_model=MessageResponse)
def logout(payload: RefreshTokenRequest, auth_service: AuthServiceDependency) -> MessageResponse:
    auth_service.logout(payload.refresh_token)
    return MessageResponse(message="logged_out")


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(
    payload: VerifyEmailRequest, auth_service: AuthServiceDependency
) -> MessageResponse:
    auth_service.verify_email(payload.token)
    return MessageResponse(message="email_verified")


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(
    payload: ResendVerificationRequest, auth_service: AuthServiceDependency
) -> MessageResponse:
    auth_service.resend_verification(payload.email)
    return MessageResponse(message="verification_sent")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    payload: ForgotPasswordRequest, auth_service: AuthServiceDependency
) -> MessageResponse:
    auth_service.forgot_password(payload.email)
    return MessageResponse(message="reset_sent")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    payload: ResetPasswordRequest, auth_service: AuthServiceDependency
) -> MessageResponse:
    auth_service.reset_password(payload.token, payload.password)
    return MessageResponse(message="password_reset")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    user: CurrentUser,
    auth_service: AuthServiceDependency,
) -> MessageResponse:
    auth_service.change_password(user, payload.current_password, payload.new_password)
    return MessageResponse(message="password_changed")


@router.get("/me", response_model=UserResponse)
def current_user(user: CurrentUser) -> UserResponse:
    return UserResponse.from_user(user)
