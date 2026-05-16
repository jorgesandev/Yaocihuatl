from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import AuditLog, Role, User
from app.schemas.users import UserCreateRequest, UserUpdateRequest
from app.services.auth.security import hash_password


class UserError(ValueError):
    pass


class UserService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_users(self) -> list[User]:
        return list(
            self.db.scalars(
                select(User).options(selectinload(User.roles), selectinload(User.organization))
            ).all()
        )

    def create_user(self, request: UserCreateRequest, actor_user_id: UUID | None = None) -> User:
        existing = self.db.scalar(select(User).where(User.username == request.username.strip().lower()))
        if existing is not None:
            raise UserError("El nombre de usuario ya existe.")

        user = User(
            username=request.username.strip().lower(),
            display_name=request.display_name,
            email=request.email,
            password_hash=hash_password(request.password),
            organization_id=request.organization_id,
            status="active",
            is_demo=True,
        )
        if request.role_codes:
            roles = self.db.scalars(select(Role).where(Role.code.in_(request.role_codes))).all()
            user.roles = list(roles)
        self.db.add(user)
        self.db.flush()
        self.audit(
            action="user.create",
            outcome="success",
            actor_user_id=actor_user_id,
            entity_schema="iam",
            entity_table="users",
            entity_id=str(user.id),
            metadata={"username": user.username, "roles": request.role_codes},
        )
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user(self, user_id: UUID) -> User | None:
        return self.db.scalar(
            select(User)
            .options(selectinload(User.roles), selectinload(User.organization))
            .where(User.id == user_id)
        )

    def update_user(
        self, user: User, request: UserUpdateRequest, actor_user_id: UUID | None = None
    ) -> User:
        if request.display_name is not None:
            user.display_name = request.display_name
        if request.email is not None:
            user.email = request.email
        if request.organization_id is not None:
            user.organization_id = request.organization_id
        if request.status is not None:
            user.status = request.status
        user.updated_at = datetime.now(timezone.utc)
        self.audit(
            action="user.update",
            outcome="success",
            actor_user_id=actor_user_id,
            entity_schema="iam",
            entity_table="users",
            entity_id=str(user.id),
            metadata={"username": user.username, "fields_changed": [k for k, v in request.model_dump(exclude_unset=True).items() if v is not None]},
        )
        self.db.commit()
        self.db.refresh(user)
        return user

    def disable_user(self, user: User, actor_user_id: UUID | None = None) -> User:
        user.status = "disabled"
        user.updated_at = datetime.now(timezone.utc)
        self.audit(
            action="user.disable",
            outcome="success",
            actor_user_id=actor_user_id,
            entity_schema="iam",
            entity_table="users",
            entity_id=str(user.id),
            metadata={"username": user.username},
        )
        self.db.commit()
        self.db.refresh(user)
        return user

    def assign_roles(self, user: User, role_codes: list[str], actor_user_id: UUID | None = None) -> User:
        roles = self.db.scalars(select(Role).where(Role.code.in_(role_codes))).all()
        existing_codes = {role.code for role in user.roles}
        for role in roles:
            if role.code not in existing_codes:
                user.roles.append(role)
        self.audit(
            action="user.assign_roles",
            outcome="success",
            actor_user_id=actor_user_id,
            entity_schema="iam",
            entity_table="users",
            entity_id=str(user.id),
            metadata={"username": user.username, "assigned_roles": role_codes},
        )
        self.db.commit()
        self.db.refresh(user)
        return user

    def remove_role(self, user: User, role_code: str, actor_user_id: UUID | None = None) -> User:
        user.roles = [role for role in user.roles if role.code != role_code]
        self.audit(
            action="user.remove_role",
            outcome="success",
            actor_user_id=actor_user_id,
            entity_schema="iam",
            entity_table="users",
            entity_id=str(user.id),
            metadata={"username": user.username, "removed_role": role_code},
        )
        self.db.commit()
        self.db.refresh(user)
        return user

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
