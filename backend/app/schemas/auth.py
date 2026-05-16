from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=80)
    password: str = Field(..., min_length=1, max_length=200)


class RoleSummary(BaseModel):
    code: str
    label: str


class OrganizationSummary(BaseModel):
    id: UUID
    name: str
    slug: str
    org_type: str


class CurrentUser(BaseModel):
    id: UUID
    username: str
    display_name: str
    is_demo: bool
    organization: OrganizationSummary | None
    roles: List[RoleSummary]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    user: CurrentUser


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=200)
    new_password: str = Field(..., min_length=8, max_length=200)


class MessageResponse(BaseModel):
    message: str
