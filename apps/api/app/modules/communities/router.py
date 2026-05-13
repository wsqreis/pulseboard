from __future__ import annotations

from fastapi import APIRouter, status

from app.modules.auth.dependencies import CurrentUser
from app.modules.auth.schemas import MessageResponse
from app.modules.communities.dependencies import CommunityServiceDependency
from app.modules.communities.schemas import (
    BoardResponse,
    CommunityResponse,
    CreateBoardRequest,
    CreateCommunityRequest,
    MembershipResponse,
)

router = APIRouter(prefix="/communities", tags=["communities"])


@router.get("", response_model=list[CommunityResponse])
def list_communities(service: CommunityServiceDependency) -> list[CommunityResponse]:
    return service.list_communities()


@router.post("", response_model=CommunityResponse, status_code=status.HTTP_201_CREATED)
def create_community(
    payload: CreateCommunityRequest,
    user: CurrentUser,
    service: CommunityServiceDependency,
) -> CommunityResponse:
    return service.create_community(
        user=user,
        name=payload.name,
        description=payload.description,
        visibility=payload.visibility,
    )


@router.get("/{slug}", response_model=CommunityResponse)
def get_community(slug: str, service: CommunityServiceDependency) -> CommunityResponse:
    return service.get_community(slug)


@router.post("/{slug}/join", response_model=MembershipResponse)
def join_community(
    slug: str,
    user: CurrentUser,
    service: CommunityServiceDependency,
) -> MembershipResponse:
    return service.join_community(user, slug)


@router.post("/{slug}/leave", response_model=MessageResponse)
def leave_community(
    slug: str,
    user: CurrentUser,
    service: CommunityServiceDependency,
) -> MessageResponse:
    service.leave_community(user, slug)
    return MessageResponse(message="left_community")


@router.get("/{slug}/boards", response_model=list[BoardResponse])
def list_boards(slug: str, service: CommunityServiceDependency) -> list[BoardResponse]:
    return service.list_boards(slug)


@router.post("/{slug}/boards", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    slug: str,
    payload: CreateBoardRequest,
    user: CurrentUser,
    service: CommunityServiceDependency,
) -> BoardResponse:
    return service.create_board(
        user=user,
        community_slug=slug,
        name=payload.name,
        description=payload.description,
        sort_order=payload.sort_order,
    )
