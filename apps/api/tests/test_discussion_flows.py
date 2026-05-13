from __future__ import annotations

from typing import Any, cast

from fastapi.testclient import TestClient

from app.modules.auth.email import email_gateway


def extract_token_from_email() -> str:
    body = email_gateway.outbox[-1].body
    return body.split("token=", maxsplit=1)[1]


def register_and_verify(client: TestClient, email: str, display_name: str) -> dict[str, Any]:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "StrongPass123",
            "display_name": display_name,
        },
    )
    assert register_response.status_code == 201
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


def test_posts_comments_and_moderation(client: TestClient) -> None:
    owner_auth = register_and_verify(client, "owner@example.com", "Owner")
    member_auth = register_and_verify(client, "member@example.com", "Member")

    community_response = client.post(
        "/api/v1/communities",
        json={
            "name": "Product Guild",
            "description": "A place to discuss product ideas and execution.",
            "visibility": "public",
        },
        headers={"Authorization": f"Bearer {owner_auth['tokens']['access_token']}"},
    )
    assert community_response.status_code == 201
    community = community_response.json()

    board_response = client.post(
        f"/api/v1/communities/{community['slug']}/boards",
        json={
            "name": "General",
            "description": "General product discussion.",
            "sort_order": 0,
        },
        headers={"Authorization": f"Bearer {owner_auth['tokens']['access_token']}"},
    )
    assert board_response.status_code == 201
    board = board_response.json()

    join_response = client.post(
        f"/api/v1/communities/{community['slug']}/join",
        headers={"Authorization": f"Bearer {member_auth['tokens']['access_token']}"},
    )
    assert join_response.status_code == 200

    post_response = client.post(
        f"/api/v1/boards/{community['slug']}/{board['slug']}/posts",
        json={
            "title": "Weekly planning",
            "body_markdown": "Let's align on goals and blockers for the week.",
        },
        headers={"Authorization": f"Bearer {member_auth['tokens']['access_token']}"},
    )
    assert post_response.status_code == 201
    post = post_response.json()

    comment_response = client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"body_markdown": "First comment from the team."},
        headers={"Authorization": f"Bearer {owner_auth['tokens']['access_token']}"},
    )
    assert comment_response.status_code == 201

    list_posts_response = client.get(f"/api/v1/boards/{community['slug']}/{board['slug']}/posts")
    assert list_posts_response.status_code == 200
    assert len(list_posts_response.json()) == 1

    list_comments_response = client.get(f"/api/v1/posts/{post['id']}/comments")
    assert list_comments_response.status_code == 200
    assert len(list_comments_response.json()) == 1

    update_post_response = client.patch(
        f"/api/v1/posts/{post['id']}",
        json={
            "title": "Weekly planning updated",
            "body_markdown": "Updated plan with new milestones.",
        },
        headers={"Authorization": f"Bearer {member_auth['tokens']['access_token']}"},
    )
    assert update_post_response.status_code == 200

    pin_response = client.post(
        f"/api/v1/posts/{post['id']}/moderate",
        json={"action": "pin"},
        headers={"Authorization": f"Bearer {owner_auth['tokens']['access_token']}"},
    )
    assert pin_response.status_code == 200
    assert pin_response.json()["is_pinned"] is True

    lock_response = client.post(
        f"/api/v1/posts/{post['id']}/moderate",
        json={"action": "lock"},
        headers={"Authorization": f"Bearer {owner_auth['tokens']['access_token']}"},
    )
    assert lock_response.status_code == 200
    assert lock_response.json()["is_locked"] is True

    locked_comment_response = client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"body_markdown": "This should fail because the post is locked."},
        headers={"Authorization": f"Bearer {member_auth['tokens']['access_token']}"},
    )
    assert locked_comment_response.status_code == 400

    delete_response = client.post(
        f"/api/v1/posts/{post['id']}/moderate",
        json={"action": "delete"},
        headers={"Authorization": f"Bearer {owner_auth['tokens']['access_token']}"},
    )
    assert delete_response.status_code == 200
    assert delete_response.json()["status"] == "deleted"
