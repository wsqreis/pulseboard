from __future__ import annotations

from pydantic import BaseModel, Field

from app.modules.communities.models import Board, Community, CommunityVisibility, Membership


class CreateCommunityRequest(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=1000)
    visibility: CommunityVisibility = CommunityVisibility.public


class CreateBoardRequest(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=1000)
    sort_order: int = Field(default=0, ge=0, le=1000)


class CommunityResponse(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    visibility: CommunityVisibility
    created_by: str

    @classmethod
    def from_model(cls, community: Community) -> CommunityResponse:
        return cls(
            id=community.id,
            slug=community.slug,
            name=community.name,
            description=community.description,
            visibility=community.visibility,
            created_by=community.created_by,
        )


class MembershipResponse(BaseModel):
    community_id: str
    user_id: str
    role: str

    @classmethod
    def from_model(cls, membership: Membership) -> MembershipResponse:
        return cls(
            community_id=membership.community_id,
            user_id=membership.user_id,
            role=membership.role.value,
        )


class BoardResponse(BaseModel):
    id: str
    community_id: str
    slug: str
    name: str
    description: str
    sort_order: int

    @classmethod
    def from_model(cls, board: Board) -> BoardResponse:
        return cls(
            id=board.id,
            community_id=board.community_id,
            slug=board.slug,
            name=board.name,
            description=board.description,
            sort_order=board.sort_order,
        )
