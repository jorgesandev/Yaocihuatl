from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.db.models import User
from app.schemas.auth import (
    ChangePasswordRequest,
    CurrentUser,
    LoginRequest,
    MessageResponse,
    TokenResponse,
)
from app.services.auth.service import AuthError, AuthService


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(request_body: LoginRequest, request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    auth_service = AuthService(db)
    try:
        token, expires_at, user = auth_service.authenticate(
            username=request_body.username.strip().lower(),
            password=request_body.password,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    except AuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return TokenResponse(
        access_token=token,
        expires_at=expires_at,
        user=auth_service.to_current_user(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    auth_service = AuthService(db)
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    auth_service.logout(
        user=current_user,
        token=token,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return MessageResponse(message="Sesión cerrada correctamente.")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    request_body: ChangePasswordRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    auth_service = AuthService(db)
    try:
        auth_service.change_password(
            user=current_user,
            current_password=request_body.current_password,
            new_password=request_body.new_password,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
    except AuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return MessageResponse(message="Contraseña actualizada correctamente.")


@router.get("/me", response_model=CurrentUser)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> CurrentUser:
    return AuthService(db).to_current_user(current_user)
