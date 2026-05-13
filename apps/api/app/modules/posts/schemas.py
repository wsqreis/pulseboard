from __future__ import annotations

from pydantic import BaseModel, Field

from app.modules.comments.models import Comment, CommentStatus
from app.modules.posts.models import Post, PostStatus


class CreatePostRequest(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    body_markdown: str = Field(min_length=10, max_length=10000)


class UpdatePostRequest(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    body_markdown: str = Field(min_length=10, max_length=10000)


class CreateCommentRequest(BaseModel):
    body_markdown: str = Field(min_length=2, max_length=5000)
    parent_id: str | None = None


class ModeratePostRequest(BaseModel):
    action: str = Field(pattern="^(lock|unlock|pin|unpin|delete)$")


class PostResponse(BaseModel):
    id: str
    board_id: str
    author_id: str
    title: str
    body_markdown: str
    status: PostStatus
    is_locked: bool
    is_pinned: bool

    @classmethod
    def from_model(cls, post: Post) -> PostResponse:
        return cls(
            id=post.id,
            board_id=post.board_id,
            author_id=post.author_id,
            title=post.title,
            body_markdown=post.body_markdown,
            status=post.status,
            is_locked=post.is_locked,
            is_pinned=post.is_pinned,
        )


class CommentResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    parent_id: str | None
    body_markdown: str
    status: CommentStatus

    @classmethod
    def from_model(cls, comment: Comment) -> CommentResponse:
        return cls(
            id=comment.id,
            post_id=comment.post_id,
            author_id=comment.author_id,
            parent_id=comment.parent_id,
            body_markdown=comment.body_markdown,
            status=comment.status,
        )
