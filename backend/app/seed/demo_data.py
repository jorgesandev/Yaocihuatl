from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal
import hashlib
from pathlib import Path
from typing import Any, TypeVar

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import (
    AuditLog,
    CaseAssignment,
    CaseStatusHistory,
    ChimalliCaseRagSource,
    ChimalliExtraction,
    ChimalliLlmInteractionLog,
    ChimalliMessage,
    ChimalliPersistentCase,
    ChimalliRagSource,
    ChimalliRoutingSuggestion,
    ChimalliVpmrgTest,
    ConsentRecord,
    CoreCase,
    MachiyotlCustodyEvent,
    MachiyotlEvidenceItem,
    MachiyotlEvidenceNote,
    ObservatoryAggregateMetric,
    Organization,
    PrivacyPreference,
    Role,
    TlachiaAlert,
    TlachiaAlertSignal,
    TlachiaCluster,
    TlachiaSanitizedMention,
    User,
)
from app.db.session import create_session
from app.services.auth.security import hash_password


ModelT = TypeVar("ModelT")


DEMO_CREDENTIALS = {
    "admin": ("admin123", "Administradora demo", "admin", "electoral-authority"),
    "mujer": ("protegida", "Mujer protegida demo", "protected_user", "protected-program"),
    "analista": ("electoral", "Analista electoral demo", "electoral_analyst", "electoral-authority"),
    "revisor": ("juzgadora", "Persona juzgadora demo", "judicial_reviewer", "judicial-review"),
    "observador": ("ciudadana", "Observación ciudadana demo", "civic_observer", "civic-observatory"),
}


def _one_by(db: Session, model_cls: type[ModelT], column_name: str, value: Any) -> ModelT | None:
    return db.scalar(select(model_cls).where(getattr(model_cls, column_name) == value))


def _upsert_by(db: Session, model_cls: type[ModelT], column_name: str, value: Any, **fields) -> ModelT:
    instance = _one_by(db, model_cls, column_name, value)
    if instance is None:
        instance = model_cls(**{column_name: value}, **fields)
        db.add(instance)
    else:
        for field, field_value in fields.items():
            setattr(instance, field, field_value)
    db.flush()
    return instance


def _demo_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def _write_demo_evidence_file(file_name: str, content: str) -> tuple[str, int, str]:
    settings = get_settings()
    storage_path = Path(settings.local_evidence_storage_path)
    storage_path.mkdir(parents=True, exist_ok=True)
    file_path = storage_path / file_name
    file_path.write_text(content, encoding="utf-8")
    return str(file_path), file_path.stat().st_size, _demo_hash(content)


def seed_demo_data(db: Session) -> None:
    settings = get_settings()
    if settings.app_env == "production":
        raise RuntimeError("Demo seed data must not run in production.")

    now = datetime.now(timezone.utc)
    organizations = {
        "protected-program": _upsert_by(
            db,
            Organization,
            "slug",
            "protected-program",
            name="Programa demo de protección",
            org_type="support_program",
            is_demo=True,
        ),
        "electoral-authority": _upsert_by(
            db,
            Organization,
            "slug",
            "electoral-authority",
            name="Autoridad electoral demo",
            org_type="electoral_authority",
            is_demo=True,
        ),
        "judicial-review": _upsert_by(
            db,
            Organization,
            "slug",
            "judicial-review",
            name="Órgano revisor demo",
            org_type="judicial_review",
            is_demo=True,
        ),
        "civic-observatory": _upsert_by(
            db,
            Organization,
            "slug",
            "civic-observatory",
            name="Observatorio ciudadano demo",
            org_type="public_observatory",
            is_demo=True,
        ),
    }

    roles = {
        "admin": _upsert_by(
            db,
            Role,
            "code",
            "admin",
            label="Administradora",
            description="Gestiona usuarios, roles, fuentes y auditoria.",
        ),
        "protected_user": _upsert_by(
            db,
            Role,
            "code",
            "protected_user",
            label="Mujer protegida",
            description="Preserva evidencia y recibe orientación clara.",
        ),
        "electoral_analyst": _upsert_by(
            db,
            Role,
            "code",
            "electoral_analyst",
            label="Autoridad electoral / Analista",
            description="Revisa señales, expedientes y rutas de atención.",
        ),
        "judicial_reviewer": _upsert_by(
            db,
            Role,
            "code",
            "judicial_reviewer",
            label="Persona juzgadora / Revisor",
            description="Consulta evidencia, integridad y contexto documentado.",
        ),
        "civic_observer": _upsert_by(
            db,
            Role,
            "code",
            "civic_observer",
            label="Observación ciudadana",
            description="Consulta datos agregados y anonimizados.",
        ),
    }

    users: dict[str, User] = {}
    for username, (password, display_name, role_code, organization_slug) in DEMO_CREDENTIALS.items():
        user = _upsert_by(
            db,
            User,
            "username",
            username,
            organization_id=organizations[organization_slug].id,
            display_name=display_name,
            email=None,
            password_hash=hash_password(password),
            status="active",
            is_demo=True,
        )
        role = roles[role_code]
        if role not in user.roles:
            user.roles.append(role)
        users[username] = user

    protected_user = users["mujer"]
    analyst = users["analista"]
    reviewer = users["revisor"]

    _upsert_by(
        db,
        ConsentRecord,
        "consent_type",
        "demo_data_processing",
        user_id=protected_user.id,
        status="accepted",
        version=settings.demo_seed_version,
        accepted_at=now,
        revoked_at=None,
    )
    _upsert_by(
        db,
        PrivacyPreference,
        "user_id",
        protected_user.id,
        notification_preferences={"email": False, "in_app": True},
        retention_days=180,
        share_with_authority=False,
        allow_research_aggregation=True,
    )

    core_case = _upsert_by(
        db,
        CoreCase,
        "case_code",
        "YAO-2026-DEMO-001",
        protected_user_id=protected_user.id,
        current_owner_id=analyst.id,
        status="in_review",
        priority="medium",
        title="Expediente demo de orientación y evidencia",
        narrative_summary=(
            "Caso sintético para mostrar captura de evidencia, orientación Chimalli, "
            "revisión humana y datos agregados sin información real."
        ),
        data_classification="synthetic_demo",
    )
    _upsert_by(
        db,
        CaseAssignment,
        "role_in_case",
        "primary_analyst",
        case_id=core_case.id,
        user_id=analyst.id,
        assigned_at=now,
        unassigned_at=None,
    )
    _upsert_by(
        db,
        CaseAssignment,
        "role_in_case",
        "judicial_reviewer",
        case_id=core_case.id,
        user_id=reviewer.id,
        assigned_at=now,
        unassigned_at=None,
    )
    _upsert_by(
        db,
        CaseStatusHistory,
        "to_status",
        "in_review",
        case_id=core_case.id,
        from_status="draft",
        actor_user_id=analyst.id,
        reason="Seed demo para flujo institucional desplegable.",
    )

    file_path, size_bytes, evidence_hash = _write_demo_evidence_file(
        "evidence-demo-captura.txt",
        "Contenido sintético de evidencia demo. No contiene datos reales ni capturas sensibles.",
    )
    evidence = _upsert_by(
        db,
        MachiyotlEvidenceItem,
        "evidence_code",
        "EVD-2026-DEMO-001",
        case_id=core_case.id,
        owner_user_id=protected_user.id,
        evidence_type="screenshot_placeholder",
        platform="Plataforma demo A",
        source_url="https://example.invalid/demo/evidence-001",
        local_file_path=file_path,
        original_filename="evidence-demo-captura.txt",
        mime_type="text/plain",
        size_bytes=size_bytes,
        sha256_hash=evidence_hash,
        short_hash=evidence_hash[:12],
        status="sealed-local",
        privacy_state="local-file-demo",
        captured_at=now,
        sealed_at=now,
    )
    _upsert_by(
        db,
        MachiyotlEvidenceNote,
        "note",
        "Nota demo: evidencia sintética revisable antes de cualquier envío.",
        evidence_id=evidence.id,
        author_user_id=protected_user.id,
    )
    _upsert_by(
        db,
        MachiyotlCustodyEvent,
        "event_type",
        "sealed_local",
        evidence_id=evidence.id,
        actor_user_id=protected_user.id,
        event_label="Evidencia sellada localmente",
        event_hash=evidence_hash,
        occurred_at=now,
        metadata_json={"demo": True, "device_scope": "local"},
    )

    alert = _upsert_by(
        db,
        TlachiaAlert,
        "alert_code",
        "TLA-2026-DEMO-001",
        case_id=core_case.id,
        protected_person_label="Persona protegida 01",
        platform="Plataforma demo A",
        risk_level="medium",
        risk_score=Decimal("68.00"),
        suggested_status="pendiente de revisión humana",
        motive="Patrón detectado de mensajes similares con posible lenguaje basado en género.",
        detected_at=now,
        review_status="pending_human_review",
        created_by_id=analyst.id,
    )
    _upsert_by(
        db,
        TlachiaAlertSignal,
        "signal_type",
        "coordinated_similarity",
        alert_id=alert.id,
        label="Mensajes similares",
        explanation="Varias cuentas demo publicaron frases estructuralmente parecidas en una ventana corta.",
        weight=Decimal("0.42"),
    )
    _upsert_by(
        db,
        TlachiaSanitizedMention,
        "mention_code",
        "MEN-2026-DEMO-001",
        alert_id=alert.id,
        platform="Plataforma demo A",
        sanitized_excerpt="Fragmento sintético anonimizado; no replica publicaciones reales.",
        occurred_at=now,
        metadata_json={"synthetic": True, "contains_real_handle": False},
    )
    cluster = _upsert_by(
        db,
        TlachiaCluster,
        "cluster_code",
        "CLU-2026-DEMO-001",
        label="Cluster demo de coordinación ligera",
        platform="Plataforma demo A",
        coordination_pattern="Actividad concentrada con similitud textual sintética.",
        risk_level="medium",
        account_count=14,
        message_count=38,
        detected_at=now,
    )
    db.execute(
        text(
            """
            INSERT INTO tlachia.cluster_alerts (cluster_id, alert_id)
            VALUES (:cluster_id, :alert_id)
            ON CONFLICT DO NOTHING
            """
        ),
        {"cluster_id": cluster.id, "alert_id": alert.id},
    )

    chimalli_case = _upsert_by(
        db,
        ChimalliPersistentCase,
        "chimalli_case_code",
        "CHM-2026-DEMO-001",
        core_case_id=core_case.id,
        protected_user_id=protected_user.id,
        status="draft",
        narrative=(
            "Narrativa sintética para orientación: una persona con actividad política local "
            "describe publicaciones demo con estereotipos de género y posible afectación a su participación."
        ),
        human_review_notice=(
            "Orientación preliminar generada por IA. Requiere revisión humana y validación de autoridad competente; "
            "no sustituye asesoría legal ni constituye resolución."
        ),
    )
    _upsert_by(
        db,
        ChimalliMessage,
        "content",
        "Hola. Soy Chimalli y puedo ayudarte a ordenar información para revisión humana.",
        chimalli_case_id=chimalli_case.id,
        sender_type="assistant",
    )
    _upsert_by(
        db,
        ChimalliExtraction,
        "extraction_type",
        "entities",
        chimalli_case_id=chimalli_case.id,
        payload={
            "persona": "Persona protegida 01",
            "contexto_politico": "Actividad política local demo",
            "plataforma": "Plataforma demo A",
            "municipio": "Municipio demo",
        },
        confidence=Decimal("0.70"),
        editable=True,
    )
    _upsert_by(
        db,
        ChimalliVpmrgTest,
        "overall_result",
        "insufficient_information",
        chimalli_case_id=chimalli_case.id,
        confidence="low",
        elements={
            "political_electoral_link": "Requiere revisión humana.",
            "gender_element": "Sugerencia IA no concluyente.",
            "political_rights_impact": "Pendiente de documentar.",
        },
    )
    _upsert_by(
        db,
        ChimalliRoutingSuggestion,
        "procedure",
        "Ruta por validar",
        chimalli_case_id=chimalli_case.id,
        suggested_authority="Autoridad electoral competente demo",
        reason="Sugerencia sintética para demostrar canalización con validación humana.",
        alternatives={"routes": ["Orientación institucional", "Revisión por autoridad competente"]},
        status="suggested",
    )
    rag_source = _upsert_by(
        db,
        ChimalliRagSource,
        "source_code",
        "RAG-DEMO-001",
        source_file="procedimiento_guia-denuncia-vpmrg-ieebc_bc_2024.pdf",
        collection="02_procedimiento_ieebc",
        document_type="guia",
        jurisdiction="Baja California",
        institution="IEEBC",
        page=1,
        excerpt="Fragmento demo para mostrar fuente RAG recuperada; validar corpus antes de producción.",
        score=Decimal("0.8100"),
        metadata_json={"synthetic_metadata": True, "version": settings.demo_seed_version},
    )
    _upsert_by(
        db,
        ChimalliCaseRagSource,
        "ranking",
        1,
        chimalli_case_id=chimalli_case.id,
        rag_source_id=rag_source.id,
    )
    _upsert_by(
        db,
        ChimalliLlmInteractionLog,
        "prompt_version",
        "chimalli-system-demo-v1",
        chimalli_case_id=chimalli_case.id,
        provider="openrouter",
        model="deepseek/deepseek-chat",
        request_metadata={"stored_prompt": False, "reason": "minimización de datos"},
        response_metadata={"stored_response": False, "human_review_required": True},
        demo_mode=True,
    )

    metrics = [
        ("alerts_by_period", "period", "2026-05", 42),
        ("platform_distribution", "platform", "Plataforma demo A", 18),
        ("routing_time_average", "days_bucket", "0-2", 11),
    ]
    for metric_type, dimension, dimension_value, count_value in metrics:
        _upsert_by(
            db,
            ObservatoryAggregateMetric,
            "dimension_value",
            dimension_value,
            metric_date=date(2026, 5, 15),
            metric_type=metric_type,
            dimension=dimension,
            count_value=count_value,
            k_anonymity_threshold=10,
            is_publishable=count_value >= 10,
            metadata_json={"synthetic": True, "k_anonymity_applied": True},
        )

    existing_seed_audit = db.scalar(
        select(AuditLog).where(
            AuditLog.action == "seed.demo_data",
            AuditLog.metadata_json["version"].as_string() == settings.demo_seed_version,
        )
    )
    if existing_seed_audit is None:
        db.add(
            AuditLog(
                action="seed.demo_data",
                outcome="success",
                metadata_json={"version": settings.demo_seed_version, "synthetic": True},
            )
        )
    db.commit()


def main() -> None:
    with create_session() as db:
        seed_demo_data(db)


if __name__ == "__main__":
    main()
