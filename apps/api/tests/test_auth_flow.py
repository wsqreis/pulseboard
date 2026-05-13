from __future__ import annotations

from typing import Any, cast

from fastapi.testclient import TestClient

from app.modules.auth.email import email_gateway


def extract_token_from_email() -> str:
    body = email_gateway.outbox[-1].body
    return body.split("token=", maxsplit=1)[1]


def register_user(client: TestClient) -> dict[str, Any]:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "password": "StrongPass123",
            "display_name": "Pulse User",
        },
    )
    assert response.status_code == 201
    return cast(dict[str, Any], response.json())


def verify_registered_user(client: TestClient) -> None:
    token = extract_token_from_email()
    response = client.post("/api/v1/auth/verify-email", json={"token": token})
    assert response.status_code == 200


def test_register_verify_login_refresh_and_me(client: TestClient) -> None:
    register_user(client)
    verify_registered_user(client)

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    login_payload = login_response.json()
    assert login_payload["user"]["email_verified"] is True

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {login_payload['tokens']['access_token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "user@example.com"

    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": login_payload["tokens"]["refresh_token"]},
    )
    assert refresh_response.status_code == 200
    assert (
        refresh_response.json()["tokens"]["refresh_token"]
        != login_payload["tokens"]["refresh_token"]
    )


def test_forgot_reset_change_and_logout(client: TestClient) -> None:
    register_user(client)
    verify_registered_user(client)

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "StrongPass123"},
    )
    refresh_token = login_response.json()["tokens"]["refresh_token"]

    forgot_response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "user@example.com"},
    )
    assert forgot_response.status_code == 200
    reset_token = extract_token_from_email()

    reset_response = client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token, "password": "NewStrongPass456"},
    )
    assert reset_response.status_code == 200

    relogin_response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "NewStrongPass456"},
    )
    assert relogin_response.status_code == 200

    change_response = client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "NewStrongPass456", "new_password": "NewestPass789"},
        headers={
            "Authorization": (
                f"Bearer {relogin_response.json()['tokens']['access_token']}"
            )
        },
    )
    assert change_response.status_code == 200

    logout_response = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": relogin_response.json()["tokens"]["refresh_token"]},
    )
    assert logout_response.status_code == 200

    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_response.status_code == 401
