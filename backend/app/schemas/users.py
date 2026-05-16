from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.auth import OrganizationSummary, RoleSummary


class UserCreateRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=80)
    display_name: str = Field(..., min_length=1, max_length=160)
    email: str | None = Field(None, max_length=240)
    password: str = Field(..., min_length=8, max_length=200)
    organization_id: UUID | None = None
    role_codes: List[str] = Field(default_factory=list)


class UserUpdateRequest(BaseModel):
    display_name: str | None = Field(None, min_length=1, max_length=160)
    email: str | None = Field(None, max_length=240)
    organization_id: UUID | None = None
    status: str | None = Field(None, pattern="^(active|disabled)$")


class UserResponse(BaseModel):
    id: UUID
    username: str
    display_name: str
    email: str | None
    status: str
    is_demo: bool
    organization: OrganizationSummary | None
    roles: List[RoleSummary]
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None
