from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.audit.models import AuditEvent
from app.modules.comments.models import Comment
from app.modules.communities.models import Board, Community, Membership, MembershipRole
from app.modules.posts.models import Post, PostStatus
from app.modules.posts.schemas import CommentResponse, PostResponse
from app.modules.users.models import User


class DiscussionService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_posts(self, community_slug: str, board_slug: str) -> list[PostResponse]:
        board = self._board_by_slugs(community_slug, board_slug)
        posts = self.session.scalars(
            select(Post)
            .where(Post.board_id == board.id)
            .order_by(Post.is_pinned.desc(), Post.created_at.desc())
        ).all()
        return [PostResponse.from_model(post) for post in posts]

    def create_post(
        self,
        user: User,
        community_slug: str,
        board_slug: str,
        title: str,
        body_markdown: str,
    ) -> PostResponse:
        board = self._board_by_slugs(community_slug, board_slug)
        self._require_membership(user.id, board.community_id)
        post = Post(
            board_id=board.id,
            author_id=user.id,
            title=title,
            body_markdown=body_markdown,
        )
        self.session.add(post)
        self.session.commit()
        return PostResponse.from_model(post)

    def get_post(self, post_id: str) -> PostResponse:
        post = self._post_by_id(post_id)
        return PostResponse.from_model(post)

    def update_post(self, user: User, post_id: str, title: str, body_markdown: str) -> PostResponse:
        post = self._post_by_id(post_id)
        if post.author_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not_post_author")
        if post.status == PostStatus.deleted:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="post_deleted")
        post.title = title
        post.body_markdown = body_markdown
        self.session.commit()
        return PostResponse.from_model(post)

    def list_comments(self, post_id: str) -> list[CommentResponse]:
        post = self._post_by_id(post_id)
        comments = self.session.scalars(
            select(Comment)
            .where(Comment.post_id == post.id)
            .order_by(Comment.created_at.asc())
        ).all()
        return [CommentResponse.from_model(comment) for comment in comments]

    def create_comment(
        self,
        user: User,
        post_id: str,
        body_markdown: str,
        parent_id: str | None,
    ) -> CommentResponse:
        post = self._post_by_id(post_id)
        board = self.session.get(Board, post.board_id)
        if board is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="board_not_found")
        self._require_membership(user.id, board.community_id)
        if post.is_locked:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="post_locked")
        if parent_id is not None:
            parent = self.session.get(Comment, parent_id)
            if parent is None or parent.post_id != post.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="invalid_parent",
                )
        comment = Comment(
            post_id=post.id,
            author_id=user.id,
            parent_id=parent_id,
            body_markdown=body_markdown,
        )
        self.session.add(comment)
        self.session.commit()
        return CommentResponse.from_model(comment)

    def moderate_post(self, user: User, post_id: str, action: str) -> PostResponse:
        post = self._post_by_id(post_id)
        board = self.session.get(Board, post.board_id)
        if board is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="board_not_found")
        membership = self._membership(user.id, board.community_id)
        if membership is None or membership.role not in {
            MembershipRole.admin,
            MembershipRole.moderator,
        }:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="insufficient_role",
            )

        if action == "lock":
            post.is_locked = True
        elif action == "unlock":
            post.is_locked = False
        elif action == "pin":
            post.is_pinned = True
        elif action == "unpin":
            post.is_pinned = False
        elif action == "delete":
            post.status = PostStatus.deleted
            post.body_markdown = "[deleted]"

        audit_event = AuditEvent(
            actor_id=user.id,
            entity_type="post",
            entity_id=post.id,
            action=action,
        )
        self.session.add(audit_event)
        self.session.commit()
        return PostResponse.from_model(post)

    def _board_by_slugs(self, community_slug: str, board_slug: str) -> Board:
        query = (
            select(Board)
            .join(Community, Board.community_id == Community.id)
            .where(Board.slug == board_slug)
            .where(Community.slug == community_slug)
        )
        board = self.session.scalar(query)
        if board is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="board_not_found")
        return board

    def _post_by_id(self, post_id: str) -> Post:
        post = self.session.get(Post, post_id)
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="post_not_found")
        return post

    def _membership(self, user_id: str, community_id: str) -> Membership | None:
        return self.session.scalar(
            select(Membership).where(
                Membership.user_id == user_id,
                Membership.community_id == community_id,
            )
        )

    def _require_membership(self, user_id: str, community_id: str) -> Membership:
        membership = self._membership(user_id, community_id)
        if membership is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="membership_required")
        return membership
