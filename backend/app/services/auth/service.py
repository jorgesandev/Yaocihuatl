from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import AuditLog, SessionToken, User
from app.schemas.auth import CurrentUser, OrganizationSummary, RoleSummary
from app.services.auth.security import create_access_token, decode_access_token, hash_password, verify_password


class AuthError(ValueError):
    pass


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def authenticate(
        self,
        username: str,
        password: str,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> tuple[str, datetime, User]:
        user = self.get_user_by_username(username)
        if user is None or user.status != "active" or not verify_password(password, user.password_hash):
            self.audit(
                action="auth.login",
                outcome="failure",
                metadata={"username": username},
                ip_address=ip_address,
                user_agent=user_agent,
            )
            self.db.commit()
            raise AuthError("Credenciales inválidas.")

        roles = [role.code for role in user.roles]
        token, token_jti, expires_at = create_access_token(str(user.id), user.username, roles)
        self.db.add(
            SessionToken(
                user_id=user.id,
                token_jti=token_jti,
                expires_at=expires_at,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        )
        user.last_login_at = datetime.now(timezone.utc)
        self.audit(
            action="auth.login",
            outcome="success",
            actor_user_id=user.id,
            entity_schema="iam",
            entity_table="users",
            entity_id=str(user.id),
            metadata={"username": username, "roles": roles},
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.commit()
        self.db.refresh(user)
        return token, expires_at, user

    def user_from_token(self, token: str) -> User:
        try:
            payload = decode_access_token(token)
            user_id = UUID(payload["sub"])
            token_jti = payload["jti"]
        except Exception as exc:
            raise AuthError("Token inválido.") from exc

        session = self.db.scalar(
            select(SessionToken).where(
                SessionToken.user_id == user_id,
                SessionToken.token_jti == token_jti,
                SessionToken.revoked_at.is_(None),
                SessionToken.expires_at > datetime.now(timezone.utc),
            )
        )
        if session is None:
            raise AuthError("Sesión no disponible.")
        user = self.get_user_by_id(user_id)
        if user is None or user.status != "active":
            raise AuthError("Usuario no disponible.")
        return user

    def get_user_by_username(self, username: str) -> User | None:
        return self.db.scalar(
            select(User)
            .options(selectinload(User.roles), selectinload(User.organization))
            .where(User.username == username.strip().lower())
        )

    def get_user_by_id(self, user_id: UUID) -> User | None:
        return self.db.scalar(
            select(User)
            .options(selectinload(User.roles), selectinload(User.organization))
            .where(User.id == user_id)
        )

    def to_current_user(self, user: User) -> CurrentUser:
        organization = None
        if user.organization is not None:
            organization = OrganizationSummary(
                id=user.organization.id,
                name=user.organization.name,
                slug=user.organization.slug,
                org_type=user.organization.org_type,
            )
        return CurrentUser(
            id=user.id,
            username=user.username,
            display_name=user.display_name,
            is_demo=user.is_demo,
            organization=organization,
            roles=[RoleSummary(code=role.code, label=role.label) for role in user.roles],
        )

    def logout(self, user: User, token: str, ip_address: str | None = None, user_agent: str | None = None) -> None:
        try:
            payload = decode_access_token(token)
            token_jti = payload["jti"]
        except Exception:
            return
        session = self.db.scalar(
            select(SessionToken).where(
                SessionToken.user_id == user.id,
                SessionToken.token_jti == token_jti,
                SessionToken.revoked_at.is_(None),
            )
        )
        if session is not None:
            session.revoked_at = datetime.now(timezone.utc)
        self.audit(
            action="auth.logout",
            outcome="success",
            actor_user_id=user.id,
            entity_schema="iam",
            entity_table="sessions",
            entity_id=token_jti,
            metadata={"username": user.username},
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.commit()

    def change_password(
        self,
        user: User,
        current_password: str,
        new_password: str,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        if not verify_password(current_password, user.password_hash):
            self.audit(
                action="auth.change_password",
                outcome="failure",
                actor_user_id=user.id,
                entity_schema="iam",
                entity_table="users",
                entity_id=str(user.id),
                metadata={"username": user.username, "reason": "current_password_mismatch"},
                ip_address=ip_address,
                user_agent=user_agent,
            )
            self.db.commit()
            raise AuthError("La contraseña actual es incorrecta.")
        user.password_hash = hash_password(new_password)
        user.updated_at = datetime.now(timezone.utc)
        self.audit(
            action="auth.change_password",
            outcome="success",
            actor_user_id=user.id,
            entity_schema="iam",
            entity_table="users",
            entity_id=str(user.id),
            metadata={"username": user.username},
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.commit()

    def audit(
        self,
        action: str,
        outcome: str,
        actor_user_id: UUID | None = None,
        entity_schema: str | None = None,
        entity_table: str | None = None,
        entity_id: str | None = None,
        metadata: dict | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        self.db.add(
            AuditLog(
                actor_user_id=actor_user_id,
                action=action,
                entity_schema=entity_schema,
                entity_table=entity_table,
                entity_id=entity_id,
                outcome=outcome,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata_json=metadata or {},
            )
        )
