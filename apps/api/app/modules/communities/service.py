from __future__ import annotations

import re

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.communities.models import (
    Board,
    Community,
    CommunityVisibility,
    Membership,
    MembershipRole,
)
from app.modules.communities.schemas import BoardResponse, CommunityResponse, MembershipResponse
from app.modules.users.models import User


class CommunityService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_communities(self) -> list[CommunityResponse]:
        communities = self.session.scalars(select(Community).order_by(Community.name.asc())).all()
        return [CommunityResponse.from_model(community) for community in communities]

    def create_community(
        self,
        user: User,
        name: str,
        description: str,
        visibility: CommunityVisibility,
    ) -> CommunityResponse:
        slug = self._build_unique_slug(name, Community)
        community = Community(
            slug=slug,
            name=name,
            description=description,
            visibility=visibility,
            created_by=user.id,
        )
        self.session.add(community)
        self.session.flush()
        membership = Membership(
            community_id=community.id,
            user_id=user.id,
            role=MembershipRole.admin,
        )
        self.session.add(membership)
        self.session.commit()
        return CommunityResponse.from_model(community)

    def get_community(self, slug: str) -> CommunityResponse:
        community = self.session.scalar(select(Community).where(Community.slug == slug))
        if community is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="community_not_found")
        return CommunityResponse.from_model(community)

    def join_community(self, user: User, slug: str) -> MembershipResponse:
        community = self._community_by_slug(slug)
        membership = self.session.scalar(
            select(Membership).where(
                Membership.community_id == community.id,
                Membership.user_id == user.id,
            )
        )
        if membership is None:
            membership = Membership(
                community_id=community.id,
                user_id=user.id,
                role=MembershipRole.member,
            )
            self.session.add(membership)
            self.session.commit()
        return MembershipResponse.from_model(membership)

    def leave_community(self, user: User, slug: str) -> None:
        community = self._community_by_slug(slug)
        membership = self.session.scalar(
            select(Membership).where(
                Membership.community_id == community.id,
                Membership.user_id == user.id,
            )
        )
        if membership is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="membership_not_found",
            )
        if membership.role == MembershipRole.admin:
            admin_count = self.session.scalar(
                select(func.count())
                .select_from(Membership)
                .where(
                    Membership.community_id == community.id,
                    Membership.role == MembershipRole.admin,
                )
            )
            if admin_count == 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="last_admin")
        self.session.delete(membership)
        self.session.commit()

    def list_boards(self, slug: str) -> list[BoardResponse]:
        community = self._community_by_slug(slug)
        boards = self.session.scalars(
            select(Board)
            .where(Board.community_id == community.id)
            .order_by(Board.sort_order.asc(), Board.name.asc())
        ).all()
        return [BoardResponse.from_model(board) for board in boards]

    def create_board(
        self,
        user: User,
        community_slug: str,
        name: str,
        description: str,
        sort_order: int,
    ) -> BoardResponse:
        community = self._community_by_slug(community_slug)
        membership = self.session.scalar(
            select(Membership).where(
                Membership.community_id == community.id,
                Membership.user_id == user.id,
            )
        )
        if membership is None or membership.role not in {
            MembershipRole.admin,
            MembershipRole.moderator,
        }:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="insufficient_role",
            )

        board = Board(
            community_id=community.id,
            slug=self._build_unique_slug(name, Board, community.id),
            name=name,
            description=description,
            sort_order=sort_order,
        )
        self.session.add(board)
        self.session.commit()
        return BoardResponse.from_model(board)

    def _community_by_slug(self, slug: str) -> Community:
        community = self.session.scalar(select(Community).where(Community.slug == slug))
        if community is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="community_not_found")
        return community

    def _build_unique_slug(
        self,
        value: str,
        model: type[Community] | type[Board],
        community_id: str | None = None,
    ) -> str:
        base_slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "item"
        candidate = base_slug
        suffix = 1
        while self._slug_exists(candidate, model, community_id):
            suffix += 1
            candidate = f"{base_slug}-{suffix}"
        return candidate

    def _slug_exists(
        self,
        slug: str,
        model: type[Community] | type[Board],
        community_id: str | None = None,
    ) -> bool:
        query = select(model).where(model.slug == slug)
        if model is Board and community_id is not None:
            query = query.where(Board.community_id == community_id)
        return self.session.scalar(query) is not None
