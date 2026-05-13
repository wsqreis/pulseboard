from __future__ import annotations

from typing import Any, cast

from fastapi.testclient import TestClient

from app.modules.auth.email import email_gateway


def extract_token_from_email() -> str:
    body = email_gateway.outbox[-1].body
    return body.split("token=", maxsplit=1)[1]


def register_and_verify(client: TestClient, email: str, display_name: str) -> dict[str, Any]:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "StrongPass123",
            "display_name": display_name,
        },
    )
    assert response.status_code == 201
    verify_response = client.post(
        "/api/v1/auth/verify-email",
        json={"token": extract_token_from_email()},
    )
    assert verify_response.status_code == 200
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    return cast(dict[str, Any], login_response.json())


def test_create_join_leave_and_board_permissions(client: TestClient) -> None:
    owner_auth = register_and_verify(client, "owner@example.com", "Owner")
    member_auth = register_and_verify(client, "member@example.com", "Member")

    create_response = client.post(
        "/api/v1/communities",
        json={
            "name": "Builders Circle",
            "description": "A place for builders to share progress and ideas.",
            "visibility": "public",
        },
        headers={"Authorization": f"Bearer {owner_auth['tokens']['access_token']}"},
    )
    assert create_response.status_code == 201
    community = create_response.json()
    assert community["slug"] == "builders-circle"

    list_response = client.get("/api/v1/communities")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    join_response = client.post(
        f"/api/v1/communities/{community['slug']}/join",
        headers={"Authorization": f"Bearer {member_auth['tokens']['access_token']}"},
    )
    assert join_response.status_code == 200
    assert join_response.json()["role"] == "member"

    forbidden_board_response = client.post(
        f"/api/v1/communities/{community['slug']}/boards",
        json={
            "name": "Announcements",
            "description": "Important updates for everyone.",
            "sort_order": 1,
        },
        headers={"Authorization": f"Bearer {member_auth['tokens']['access_token']}"},
    )
    assert forbidden_board_response.status_code == 403

    create_board_response = client.post(
        f"/api/v1/communities/{community['slug']}/boards",
        json={
            "name": "Announcements",
            "description": "Important updates for everyone.",
            "sort_order": 1,
        },
        headers={"Authorization": f"Bearer {owner_auth['tokens']['access_token']}"},
    )
    assert create_board_response.status_code == 201
    board = create_board_response.json()
    assert board["slug"] == "announcements"

    list_boards_response = client.get(f"/api/v1/communities/{community['slug']}/boards")
    assert list_boards_response.status_code == 200
    assert len(list_boards_response.json()) == 1

    leave_response = client.post(
        f"/api/v1/communities/{community['slug']}/leave",
        headers={"Authorization": f"Bearer {member_auth['tokens']['access_token']}"},
    )
    assert leave_response.status_code == 200
