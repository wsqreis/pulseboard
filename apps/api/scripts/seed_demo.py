from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.time import utc_now
from app.db.init_db import init_db
from app.db.session import current_engine
from app.modules.auth.security import hash_password
from app.modules.comments.models import Comment
from app.modules.communities.models import (
    Board,
    Community,
    CommunityVisibility,
    Membership,
    MembershipRole,
)
from app.modules.posts.models import Post
from app.modules.users.models import User, UserStatus


def seed_demo() -> None:
    init_db()
    engine = current_engine()
    with Session(engine) as session:
        owner = session.scalar(select(User).where(User.email == "owner@pulseboard.dev"))
        if owner is None:
            owner = User(
                email="owner@pulseboard.dev",
                password_hash=hash_password("StrongPass123"),
                display_name="Pulse Owner",
                status=UserStatus.active,
                email_verified_at=utc_now(),
            )
            session.add(owner)
            session.flush()

        community = session.scalar(select(Community).where(Community.slug == "pulseboard-demo"))
        if community is None:
            community = Community(
                slug="pulseboard-demo",
                name="Pulseboard Demo",
                description="A seeded community for local exploration and contract checks.",
                visibility=CommunityVisibility.public,
                created_by=owner.id,
            )
            session.add(community)
            session.flush()
            session.add(
                Membership(
                    community_id=community.id,
                    user_id=owner.id,
                    role=MembershipRole.admin,
                )
            )

        board = session.scalar(
            select(Board).where(
                Board.slug == "general",
                Board.community_id == community.id,
            )
        )
        if board is None:
            board = Board(
                community_id=community.id,
                slug="general",
                name="General",
                description="Seeded general discussion board.",
                sort_order=0,
            )
            session.add(board)
            session.flush()

        post = session.scalar(
            select(Post).where(
                Post.title == "Welcome to Pulseboard",
                Post.board_id == board.id,
            )
        )
        if post is None:
            post = Post(
                board_id=board.id,
                author_id=owner.id,
                title="Welcome to Pulseboard",
                body_markdown="Use this seeded content to explore the product flows.",
            )
            session.add(post)
            session.flush()

        comment = session.scalar(
            select(Comment).where(
                Comment.post_id == post.id,
                Comment.author_id == owner.id,
            )
        )
        if comment is None:
            session.add(
                Comment(
                    post_id=post.id,
                    author_id=owner.id,
                    parent_id=None,
                    body_markdown="Seeded discussion starter comment.",
                )
            )

        session.commit()


if __name__ == "__main__":
    seed_demo()
