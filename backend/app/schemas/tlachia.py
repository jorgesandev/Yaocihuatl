from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class TlachiaSourceCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=160)
    subreddit: str = Field(..., min_length=1, max_length=120)
    query_terms: list[str] = Field(default_factory=list)
    protected_labels: list[str] = Field(default_factory=list)
    polling_interval_minutes: int | None = Field(None, ge=1)


class TlachiaSourceUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=160)
    subreddit: str | None = Field(None, min_length=1, max_length=120)
    query_terms: list[str] | None = None
    protected_labels: list[str] | None = None
    polling_interval_minutes: int | None = Field(None, ge=1)
    status: str | None = Field(None, pattern="^(active|paused|disabled)$")


class TlachiaSourceResponse(BaseModel):
    id: UUID
    source_type: str
    name: str
    subreddit: str | None
    query_terms: list[str]
    protected_labels: list[str]
    status: str
    polling_interval_minutes: int | None
    last_ingested_at: datetime | None
    created_at: datetime
    updated_at: datetime


class TlachiaIngestionRunResponse(BaseModel):
    id: UUID
    source_id: UUID | None
    provider: str
    status: str
    started_at: datetime
    finished_at: datetime | None
    items_seen: int | None
    items_stored: int | None
    alerts_created: int | None
    rate_limit_used: float | None
    rate_limit_remaining: float | None
    rate_limit_reset_seconds: int | None
    error_message: str | None


class TlachiaAlertSignalResponse(BaseModel):
    id: UUID
    signal_type: str
    label: str
    explanation: str
    weight: float
    created_at: datetime


class TlachiaSanitizedMentionResponse(BaseModel):
    id: UUID
    mention_code: str
    platform: str
    sanitized_excerpt: str
    occurred_at: datetime
    metadata: dict[str, Any]


class TlachiaAlertResponse(BaseModel):
    id: UUID
    alert_code: str
    protected_person_label: str
    platform: str
    risk_level: str
    risk_score: float
    suggested_status: str
    motive: str
    detected_at: datetime
    review_status: str
    created_at: datetime
    signals: list[TlachiaAlertSignalResponse]
    mentions: list[TlachiaSanitizedMentionResponse]


class TlachiaAlertReviewRequest(BaseModel):
    review_notes: str | None = Field(None, max_length=2000)


class TlachiaAlertReviewResponse(BaseModel):
    id: UUID
    alert_code: str
    review_status: str
    message: str
