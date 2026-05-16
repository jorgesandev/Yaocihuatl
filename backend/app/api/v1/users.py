from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.db.models import User
from app.schemas.users import (
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest,
)
from app.services.auth.service import AuthService
from app.services.users.service import UserError, UserService


router = APIRouter(prefix="/users", tags=["users"])


def _to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        email=user.email,
        status=user.status,
        is_demo=user.is_demo,
        organization=AuthService(None).to_current_user(user).organization if user.organization else None,  # type: ignore[arg-type]
        roles=[{"code": role.code, "label": role.label} for role in user.roles],  # type: ignore[misc]
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login_at=user.last_login_at,
    )


@router.get("", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> list[UserResponse]:
    users = UserService(db).list_users()
    return [_to_response(user) for user in users]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    request: UserCreateRequest,
    req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> UserResponse:
    service = UserService(db)
    try:
        user = service.create_user(
            request=request,
            actor_user_id=current_user.id,
        )
    except UserError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return _to_response(user)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> UserResponse:
    user = UserService(db).get_user(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    return _to_response(user)


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    request: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> UserResponse:
    service = UserService(db)
    user = service.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    user = service.update_user(user=user, request=request, actor_user_id=current_user.id)
    return _to_response(user)


@router.post("/{user_id}/disable", response_model=UserResponse)
def disable_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> UserResponse:
    service = UserService(db)
    user = service.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    user = service.disable_user(user=user, actor_user_id=current_user.id)
    return _to_response(user)


@router.post("/{user_id}/roles", response_model=UserResponse)
def assign_roles(
    user_id: UUID,
    role_codes: list[str],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> UserResponse:
    service = UserService(db)
    user = service.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    user = service.assign_roles(user=user, role_codes=role_codes, actor_user_id=current_user.id)
    return _to_response(user)


@router.delete("/{user_id}/roles/{role_code}", response_model=UserResponse)
def remove_role(
    user_id: UUID,
    role_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> UserResponse:
    service = UserService(db)
    user = service.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    user = service.remove_role(user=user, role_code=role_code, actor_user_id=current_user.id)
    return _to_response(user)
