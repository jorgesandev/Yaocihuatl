from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import List
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def uuid_pk() -> Mapped[UUID]:
    return mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default=text("gen_random_uuid()"),
    )


def utc_created_at() -> Mapped[datetime]:
    return mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        server_default=text("timezone('utc', now())"),
        nullable=False,
    )


user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", PG_UUID(as_uuid=True), ForeignKey("iam.users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", PG_UUID(as_uuid=True), ForeignKey("iam.roles.id", ondelete="CASCADE"), primary_key=True),
    schema="iam",
)


class Organization(Base):
    __tablename__ = "organizations"
    __table_args__ = {"schema": "iam"}

    id: Mapped[UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    org_type: Mapped[str] = mapped_column(String(40), nullable=False, default="demo")
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))
    created_at: Mapped[datetime] = utc_created_at()


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {"schema": "iam"}

    id: Mapped[UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = utc_created_at()


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "iam"}

    id: Mapped[UUID] = uuid_pk()
    organization_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.organizations.id"))
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str | None] = mapped_column(String(240))
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active", server_default="active")
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))
    created_at: Mapped[datetime] = utc_created_at()
    updated_at: Mapped[datetime] = utc_created_at()
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    organization: Mapped[Organization | None] = relationship()
    roles: Mapped[List[Role]] = relationship(secondary=user_roles, lazy="selectin")


class SessionToken(Base):
    __tablename__ = "sessions"
    __table_args__ = {"schema": "iam"}

    id: Mapped[UUID] = uuid_pk()
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id", ondelete="CASCADE"))
    token_jti: Mapped[str] = mapped_column(String(96), unique=True, nullable=False)
    issued_at: Mapped[datetime] = utc_created_at()
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ip_address: Mapped[str | None] = mapped_column(String(80))
    user_agent: Mapped[str | None] = mapped_column(Text)


class ConsentRecord(Base):
    __tablename__ = "consents"
    __table_args__ = {"schema": "iam"}

    id: Mapped[UUID] = uuid_pk()
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id", ondelete="CASCADE"))
    consent_type: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    version: Mapped[str] = mapped_column(String(40), nullable=False)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class PrivacyPreference(Base):
    __tablename__ = "privacy_preferences"
    __table_args__ = {"schema": "iam"}

    id: Mapped[UUID] = uuid_pk()
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id", ondelete="CASCADE"), unique=True)
    notification_preferences: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    retention_days: Mapped[int] = mapped_column(Integer, nullable=False, default=180, server_default="180")
    share_with_authority: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("false"))
    allow_research_aggregation: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))
    updated_at: Mapped[datetime] = utc_created_at()


class CoreCase(Base):
    __tablename__ = "cases"
    __table_args__ = {"schema": "core"}

    id: Mapped[UUID] = uuid_pk()
    case_code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    protected_user_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    current_owner_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    status: Mapped[str] = mapped_column(String(40), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    narrative_summary: Mapped[str] = mapped_column(Text, nullable=False)
    data_classification: Mapped[str] = mapped_column(String(40), nullable=False, default="synthetic_demo")
    created_at: Mapped[datetime] = utc_created_at()
    updated_at: Mapped[datetime] = utc_created_at()


class CaseAssignment(Base):
    __tablename__ = "case_assignments"
    __table_args__ = (
        UniqueConstraint("case_id", "user_id", "role_in_case", name="uq_case_assignment_role"),
        {"schema": "core"},
    )

    id: Mapped[UUID] = uuid_pk()
    case_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("core.cases.id", ondelete="CASCADE"))
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    role_in_case: Mapped[str] = mapped_column(String(40), nullable=False)
    assigned_at: Mapped[datetime] = utc_created_at()
    unassigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class CaseStatusHistory(Base):
    __tablename__ = "case_status_history"
    __table_args__ = {"schema": "core"}

    id: Mapped[UUID] = uuid_pk()
    case_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("core.cases.id", ondelete="CASCADE"))
    from_status: Mapped[str | None] = mapped_column(String(40))
    to_status: Mapped[str] = mapped_column(String(40), nullable=False)
    actor_user_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = utc_created_at()


class TlachiaAlert(Base):
    __tablename__ = "alerts"
    __table_args__ = {"schema": "tlachia"}

    id: Mapped[UUID] = uuid_pk()
    case_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("core.cases.id"))
    alert_code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    protected_person_label: Mapped[str] = mapped_column(String(120), nullable=False)
    platform: Mapped[str] = mapped_column(String(80), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    risk_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    suggested_status: Mapped[str] = mapped_column(String(80), nullable=False)
    motive: Mapped[str] = mapped_column(Text, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    review_status: Mapped[str] = mapped_column(String(40), nullable=False)
    created_by_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    created_at: Mapped[datetime] = utc_created_at()


class TlachiaAlertSignal(Base):
    __tablename__ = "alert_signals"
    __table_args__ = {"schema": "tlachia"}

    id: Mapped[UUID] = uuid_pk()
    alert_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("tlachia.alerts.id", ondelete="CASCADE"))
    signal_type: Mapped[str] = mapped_column(String(80), nullable=False)
    label: Mapped[str] = mapped_column(String(160), nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    weight: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    created_at: Mapped[datetime] = utc_created_at()


class TlachiaSanitizedMention(Base):
    __tablename__ = "sanitized_mentions"
    __table_args__ = {"schema": "tlachia"}

    id: Mapped[UUID] = uuid_pk()
    alert_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("tlachia.alerts.id", ondelete="CASCADE"))
    mention_code: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    platform: Mapped[str] = mapped_column(String(80), nullable=False)
    sanitized_excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class TlachiaSource(Base):
    __tablename__ = "sources"
    __table_args__ = {"schema": "tlachia"}

    id: Mapped[UUID] = uuid_pk()
    source_type: Mapped[str] = mapped_column(String(40), nullable=False, default="synthetic", server_default="synthetic")
    platform: Mapped[str | None] = mapped_column(String(40))
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    scenario: Mapped[str | None] = mapped_column(String(120))
    fixture_file: Mapped[str | None] = mapped_column(String(260))
    query_terms: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list, server_default=text("'[]'::jsonb"))
    protected_labels: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list, server_default=text("'[]'::jsonb"))
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="active", server_default="active")
    polling_interval_minutes: Mapped[int | None] = mapped_column(Integer)
    last_ingested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    created_at: Mapped[datetime] = utc_created_at()
    updated_at: Mapped[datetime] = utc_created_at()


class TlachiaIngestionRun(Base):
    __tablename__ = "ingestion_runs"
    __table_args__ = {"schema": "tlachia"}

    id: Mapped[UUID] = uuid_pk()
    source_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("tlachia.sources.id"))
    provider: Mapped[str] = mapped_column(String(40), nullable=False, default="synthetic", server_default="synthetic")
    platform: Mapped[str | None] = mapped_column(String(40))
    scenario: Mapped[str | None] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="started", server_default="started")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, server_default=text("timezone('utc', now())"))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    items_seen: Mapped[int | None] = mapped_column(Integer)
    items_stored: Mapped[int | None] = mapped_column(Integer)
    alerts_created: Mapped[int | None] = mapped_column(Integer)
    error_message: Mapped[str | None] = mapped_column(Text)
    created_by_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))


class TlachiaPlatformItem(Base):
    __tablename__ = "platform_items"
    __table_args__ = {"schema": "tlachia"}

    id: Mapped[UUID] = uuid_pk()
    source_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("tlachia.sources.id"))
    synthetic_id: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    platform: Mapped[str] = mapped_column(String(40), nullable=False)
    source_kind: Mapped[str] = mapped_column(String(40), nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text)
    author_hash: Mapped[str | None] = mapped_column(String(128))
    sanitized_excerpt: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = utc_created_at()


class TlachiaCluster(Base):
    __tablename__ = "clusters"
    __table_args__ = {"schema": "tlachia"}

    id: Mapped[UUID] = uuid_pk()
    cluster_code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(160), nullable=False)
    platform: Mapped[str] = mapped_column(String(80), nullable=False)
    coordination_pattern: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    account_count: Mapped[int] = mapped_column(Integer, nullable=False)
    message_count: Mapped[int] = mapped_column(Integer, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class MachiyotlEvidenceItem(Base):
    __tablename__ = "evidence_items"
    __table_args__ = {"schema": "machiyotl"}

    id: Mapped[UUID] = uuid_pk()
    case_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("core.cases.id"))
    owner_user_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    evidence_code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(60), nullable=False)
    platform: Mapped[str | None] = mapped_column(String(80))
    source_url: Mapped[str | None] = mapped_column(Text)
    local_file_path: Mapped[str | None] = mapped_column(Text)
    original_filename: Mapped[str | None] = mapped_column(String(240))
    mime_type: Mapped[str | None] = mapped_column(String(120))
    size_bytes: Mapped[int | None] = mapped_column(Integer)
    sha256_hash: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    short_hash: Mapped[str] = mapped_column(String(24), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False)
    privacy_state: Mapped[str] = mapped_column(String(40), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sealed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = utc_created_at()


class MachiyotlEvidenceNote(Base):
    __tablename__ = "evidence_notes"
    __table_args__ = {"schema": "machiyotl"}

    id: Mapped[UUID] = uuid_pk()
    evidence_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("machiyotl.evidence_items.id", ondelete="CASCADE"))
    author_user_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    note: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = utc_created_at()


class MachiyotlCustodyEvent(Base):
    __tablename__ = "custody_events"
    __table_args__ = {"schema": "machiyotl"}

    id: Mapped[UUID] = uuid_pk()
    evidence_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("machiyotl.evidence_items.id", ondelete="CASCADE"))
    actor_user_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    event_label: Mapped[str] = mapped_column(String(160), nullable=False)
    event_hash: Mapped[str | None] = mapped_column(String(128))
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class MachiyotlHashVerification(Base):
    __tablename__ = "hash_verifications"
    __table_args__ = {"schema": "machiyotl"}

    id: Mapped[UUID] = uuid_pk()
    evidence_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("machiyotl.evidence_items.id"))
    submitted_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    result: Mapped[str] = mapped_column(String(40), nullable=False)
    verified_at: Mapped[datetime] = utc_created_at()


class ChimalliPersistentCase(Base):
    __tablename__ = "cases"
    __table_args__ = {"schema": "chimalli"}

    id: Mapped[UUID] = uuid_pk()
    core_case_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("core.cases.id"))
    chimalli_case_code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    protected_user_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    status: Mapped[str] = mapped_column(String(40), nullable=False)
    narrative: Mapped[str] = mapped_column(Text, nullable=False)
    human_review_notice: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = utc_created_at()
    updated_at: Mapped[datetime] = utc_created_at()


class ChimalliAttachment(Base):
    __tablename__ = "attachments"
    __table_args__ = {"schema": "chimalli"}

    id: Mapped[UUID] = uuid_pk()
    chimalli_case_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("chimalli.cases.id", ondelete="CASCADE"))
    attachment_code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    file_name: Mapped[str] = mapped_column(String(240), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    local_file_path: Mapped[str | None] = mapped_column(Text)
    extracted_text: Mapped[str | None] = mapped_column(Text)
    visual_summary: Mapped[str | None] = mapped_column(Text)
    visual_analysis_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="uploaded_unverified")
    warning: Mapped[str] = mapped_column(Text, nullable=False, default="Adjunto no verificado; requiere revision humana.")
    created_at: Mapped[datetime] = utc_created_at()


class ChimalliMessage(Base):
    __tablename__ = "messages"
    __table_args__ = {"schema": "chimalli"}

    id: Mapped[UUID] = uuid_pk()
    chimalli_case_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("chimalli.cases.id", ondelete="CASCADE"))
    sender_type: Mapped[str] = mapped_column(String(40), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = utc_created_at()


class ChimalliExtraction(Base):
    __tablename__ = "extractions"
    __table_args__ = {"schema": "chimalli"}

    id: Mapped[UUID] = uuid_pk()
    chimalli_case_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("chimalli.cases.id", ondelete="CASCADE"))
    extraction_type: Mapped[str] = mapped_column(String(80), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    confidence: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    editable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))
    created_at: Mapped[datetime] = utc_created_at()


class ChimalliVpmrgTest(Base):
    __tablename__ = "vpmrg_tests"
    __table_args__ = {"schema": "chimalli"}

    id: Mapped[UUID] = uuid_pk()
    chimalli_case_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("chimalli.cases.id", ondelete="CASCADE"))
    overall_result: Mapped[str] = mapped_column(String(80), nullable=False)
    confidence: Mapped[str] = mapped_column(String(40), nullable=False)
    elements: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = utc_created_at()


class ChimalliRoutingSuggestion(Base):
    __tablename__ = "routing_suggestions"
    __table_args__ = {"schema": "chimalli"}

    id: Mapped[UUID] = uuid_pk()
    chimalli_case_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("chimalli.cases.id", ondelete="CASCADE"))
    suggested_authority: Mapped[str] = mapped_column(String(160), nullable=False)
    procedure: Mapped[str] = mapped_column(String(160), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    alternatives: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'[]'::jsonb"))
    status: Mapped[str] = mapped_column(String(40), nullable=False)
    created_at: Mapped[datetime] = utc_created_at()


class ChimalliRagSource(Base):
    __tablename__ = "rag_sources"
    __table_args__ = {"schema": "chimalli"}

    id: Mapped[UUID] = uuid_pk()
    source_code: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    source_file: Mapped[str] = mapped_column(String(260), nullable=False)
    collection: Mapped[str] = mapped_column(String(120), nullable=False)
    document_type: Mapped[str] = mapped_column(String(60), nullable=False)
    jurisdiction: Mapped[str] = mapped_column(String(120), nullable=False)
    institution: Mapped[str] = mapped_column(String(120), nullable=False)
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = utc_created_at()


class ChimalliCaseRagSource(Base):
    __tablename__ = "case_rag_sources"
    __table_args__ = (
        UniqueConstraint("chimalli_case_id", "rag_source_id", name="uq_chimalli_case_rag_source"),
        {"schema": "chimalli"},
    )

    id: Mapped[UUID] = uuid_pk()
    chimalli_case_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("chimalli.cases.id", ondelete="CASCADE"))
    rag_source_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("chimalli.rag_sources.id", ondelete="CASCADE"))
    ranking: Mapped[int] = mapped_column(Integer, nullable=False)


class ChimalliLlmInteractionLog(Base):
    __tablename__ = "llm_interaction_logs"
    __table_args__ = {"schema": "chimalli"}

    id: Mapped[UUID] = uuid_pk()
    chimalli_case_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("chimalli.cases.id"))
    provider: Mapped[str] = mapped_column(String(80), nullable=False)
    model: Mapped[str] = mapped_column(String(160), nullable=False)
    prompt_version: Mapped[str] = mapped_column(String(80), nullable=False)
    request_metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    response_metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    demo_mode: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))
    created_at: Mapped[datetime] = utc_created_at()


class ObservatoryAggregateMetric(Base):
    __tablename__ = "aggregate_metrics"
    __table_args__ = (
        UniqueConstraint("metric_date", "metric_type", "dimension", "dimension_value", name="uq_observatory_metric_dimension"),
        {"schema": "observatory"},
    )

    id: Mapped[UUID] = uuid_pk()
    metric_date: Mapped[date] = mapped_column(Date, nullable=False)
    metric_type: Mapped[str] = mapped_column(String(80), nullable=False)
    dimension: Mapped[str] = mapped_column(String(80), nullable=False)
    dimension_value: Mapped[str] = mapped_column(String(120), nullable=False)
    count_value: Mapped[int] = mapped_column(Integer, nullable=False)
    k_anonymity_threshold: Mapped[int] = mapped_column(Integer, nullable=False)
    is_publishable: Mapped[bool] = mapped_column(Boolean, nullable=False)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = utc_created_at()


class AuditLog(Base):
    __tablename__ = "audit_log"
    __table_args__ = {"schema": "audit"}

    id: Mapped[UUID] = uuid_pk()
    actor_user_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("iam.users.id"))
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_schema: Mapped[str | None] = mapped_column(String(80))
    entity_table: Mapped[str | None] = mapped_column(String(80))
    entity_id: Mapped[str | None] = mapped_column(String(120))
    outcome: Mapped[str] = mapped_column(String(40), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(80))
    user_agent: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = utc_created_at()
