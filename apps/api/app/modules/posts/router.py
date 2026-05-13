from __future__ import annotations

from fastapi import APIRouter, status

from app.modules.auth.dependencies import CurrentUser
from app.modules.posts.dependencies import DiscussionServiceDependency
from app.modules.posts.schemas import (
    CommentResponse,
    CreateCommentRequest,
    CreatePostRequest,
    ModeratePostRequest,
    PostResponse,
    UpdatePostRequest,
)

router = APIRouter(tags=["discussions"])


@router.get("/boards/{community_slug}/{board_slug}/posts", response_model=list[PostResponse])
def list_posts(
    community_slug: str,
    board_slug: str,
    service: DiscussionServiceDependency,
) -> list[PostResponse]:
    return service.list_posts(community_slug, board_slug)


@router.post(
    "/boards/{community_slug}/{board_slug}/posts",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(
    community_slug: str,
    board_slug: str,
    payload: CreatePostRequest,
    user: CurrentUser,
    service: DiscussionServiceDependency,
) -> PostResponse:
    return service.create_post(
        user=user,
        community_slug=community_slug,
        board_slug=board_slug,
        title=payload.title,
        body_markdown=payload.body_markdown,
    )


@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: str, service: DiscussionServiceDependency) -> PostResponse:
    return service.get_post(post_id)


@router.patch("/posts/{post_id}", response_model=PostResponse)
def update_post(
    post_id: str,
    payload: UpdatePostRequest,
    user: CurrentUser,
    service: DiscussionServiceDependency,
) -> PostResponse:
    return service.update_post(
        user=user,
        post_id=post_id,
        title=payload.title,
        body_markdown=payload.body_markdown,
    )


@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
def list_comments(post_id: str, service: DiscussionServiceDependency) -> list[CommentResponse]:
    return service.list_comments(post_id)


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    post_id: str,
    payload: CreateCommentRequest,
    user: CurrentUser,
    service: DiscussionServiceDependency,
) -> CommentResponse:
    return service.create_comment(
        user=user,
        post_id=post_id,
        body_markdown=payload.body_markdown,
        parent_id=payload.parent_id,
    )


@router.post("/posts/{post_id}/moderate", response_model=PostResponse)
def moderate_post(
    post_id: str,
    payload: ModeratePostRequest,
    user: CurrentUser,
    service: DiscussionServiceDependency,
) -> PostResponse:
    return service.moderate_post(user=user, post_id=post_id, action=payload.action)
