from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_roles
from app.db.models import (
    AuditLog,
    TlachiaAlert,
    TlachiaAlertSignal,
    TlachiaIngestionRun,
    TlachiaSanitizedMention,
    TlachiaSource,
    User,
)
from app.schemas.tlachia import (
    TlachiaAlertResponse,
    TlachiaAlertReviewRequest,
    TlachiaAlertReviewResponse,
    TlachiaIngestionRunResponse,
    TlachiaSourceCreateRequest,
    TlachiaSourceResponse,
    TlachiaSourceUpdateRequest,
)
from app.services.tlachia.ingestion_service import IngestionError, IngestionService


router = APIRouter(prefix="/tlachia", tags=["tlachia"])


def _audit(
    db: Session,
    action: str,
    outcome: str,
    actor_user_id: UUID | None = None,
    entity_id: str | None = None,
    metadata: dict | None = None,
) -> None:
    db.add(
        AuditLog(
            actor_user_id=actor_user_id,
            action=action,
            entity_schema="tlachia",
            entity_table="alerts",
            entity_id=entity_id,
            outcome=outcome,
            metadata_json=metadata or {},
        )
    )
    db.commit()


def _source_response(source: TlachiaSource) -> TlachiaSourceResponse:
    return TlachiaSourceResponse(
        id=source.id,
        source_type=source.source_type,
        name=source.name,
        subreddit=source.subreddit,
        query_terms=source.query_terms if isinstance(source.query_terms, list) else [],
        protected_labels=source.protected_labels if isinstance(source.protected_labels, list) else [],
        status=source.status,
        polling_interval_minutes=source.polling_interval_minutes,
        last_ingested_at=source.last_ingested_at,
        created_at=source.created_at,
        updated_at=source.updated_at,
    )


def _alert_response(alert: TlachiaAlert) -> TlachiaAlertResponse:
    return TlachiaAlertResponse(
        id=alert.id,
        alert_code=alert.alert_code,
        protected_person_label=alert.protected_person_label,
        platform=alert.platform,
        risk_level=alert.risk_level,
        risk_score=float(alert.risk_score),
        suggested_status=alert.suggested_status,
        motive=alert.motive,
        detected_at=alert.detected_at,
        review_status=alert.review_status,
        created_at=alert.created_at,
        signals=[
            TlachiaAlertSignalResponse(
                id=s.id,
                signal_type=s.signal_type,
                label=s.label,
                explanation=s.explanation,
                weight=float(s.weight),
                created_at=s.created_at,
            )
            for s in alert.alert_signals
        ],
        mentions=[
            TlachiaSanitizedMentionResponse(
                id=m.id,
                mention_code=m.mention_code,
                platform=m.platform,
                sanitized_excerpt=m.sanitized_excerpt,
                occurred_at=m.occurred_at,
                metadata=m.metadata_json,
            )
            for m in alert.sanitized_mentions
        ],
    )


@router.get("/sources", response_model=list[TlachiaSourceResponse])
def list_sources(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> list[TlachiaSourceResponse]:
    sources = db.scalars(select(TlachiaSource)).all()
    return [_source_response(s) for s in sources]


@router.post("/sources", response_model=TlachiaSourceResponse, status_code=status.HTTP_201_CREATED)
def create_source(
    request: TlachiaSourceCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> TlachiaSourceResponse:
    source = TlachiaSource(
        source_type="reddit",
        name=request.name,
        subreddit=request.subreddit,
        query_terms=request.query_terms,
        protected_labels=request.protected_labels,
        status="active",
        polling_interval_minutes=request.polling_interval_minutes,
        created_by_id=current_user.id,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return _source_response(source)


@router.get("/sources/{source_id}", response_model=TlachiaSourceResponse)
def get_source(
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> TlachiaSourceResponse:
    source = db.scalar(select(TlachiaSource).where(TlachiaSource.id == source_id))
    if source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuente no encontrada.")
    return _source_response(source)


@router.patch("/sources/{source_id}", response_model=TlachiaSourceResponse)
def update_source(
    source_id: UUID,
    request: TlachiaSourceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> TlachiaSourceResponse:
    source = db.scalar(select(TlachiaSource).where(TlachiaSource.id == source_id))
    if source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuente no encontrada.")
    if request.name is not None:
        source.name = request.name
    if request.subreddit is not None:
        source.subreddit = request.subreddit
    if request.query_terms is not None:
        source.query_terms = request.query_terms
    if request.protected_labels is not None:
        source.protected_labels = request.protected_labels
    if request.polling_interval_minutes is not None:
        source.polling_interval_minutes = request.polling_interval_minutes
    if request.status is not None:
        source.status = request.status
    db.commit()
    db.refresh(source)
    return _source_response(source)


@router.post("/sources/{source_id}/pause")
def pause_source(
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> TlachiaSourceResponse:
    source = db.scalar(select(TlachiaSource).where(TlachiaSource.id == source_id))
    if source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuente no encontrada.")
    source.status = "paused"
    db.commit()
    db.refresh(source)
    return _source_response(source)


@router.post("/sources/{source_id}/resume")
def resume_source(
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
) -> TlachiaSourceResponse:
    source = db.scalar(select(TlachiaSource).where(TlachiaSource.id == source_id))
    if source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fuente no encontrada.")
    source.status = "active"
    db.commit()
    db.refresh(source)
    return _source_response(source)


@router.post("/ingest/reddit", response_model=TlachiaIngestionRunResponse)
def run_reddit_ingest(
    request: Request,
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "electoral_analyst")),
) -> TlachiaIngestionRunResponse:
    try:
        run = IngestionService(db).run_reddit_ingestion(
            source_id=source_id,
            actor_user_id=current_user.id,
        )
    except IngestionError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return TlachiaIngestionRunResponse(
        id=run.id,
        source_id=run.source_id,
        provider=run.provider,
        status=run.status,
        started_at=run.started_at,
        finished_at=run.finished_at,
        items_seen=run.items_seen,
        items_stored=run.items_stored,
        alerts_created=run.alerts_created,
        rate_limit_used=float(run.rate_limit_used) if run.rate_limit_used else None,
        rate_limit_remaining=float(run.rate_limit_remaining) if run.rate_limit_remaining else None,
        rate_limit_reset_seconds=run.rate_limit_reset_seconds,
        error_message=run.error_message,
    )


@router.get("/ingestion-runs", response_model=list[TlachiaIngestionRunResponse])
def list_ingestion_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "electoral_analyst")),
) -> list[TlachiaIngestionRunResponse]:
    runs = db.scalars(select(TlachiaIngestionRun).order_by(TlachiaIngestionRun.started_at.desc())).all()
    return [
        TlachiaIngestionRunResponse(
            id=r.id,
            source_id=r.source_id,
            provider=r.provider,
            status=r.status,
            started_at=r.started_at,
            finished_at=r.finished_at,
            items_seen=r.items_seen,
            items_stored=r.items_stored,
            alerts_created=r.alerts_created,
            rate_limit_used=float(r.rate_limit_used) if r.rate_limit_used else None,
            rate_limit_remaining=float(r.rate_limit_remaining) if r.rate_limit_remaining else None,
            rate_limit_reset_seconds=r.rate_limit_reset_seconds,
            error_message=r.error_message,
        )
        for r in runs
    ]


@router.get("/ingestion-runs/{run_id}", response_model=TlachiaIngestionRunResponse)
def get_ingestion_run(
    run_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "electoral_analyst")),
) -> TlachiaIngestionRunResponse:
    run = db.scalar(select(TlachiaIngestionRun).where(TlachiaIngestionRun.id == run_id))
    if run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Corrida no encontrada.")
    return TlachiaIngestionRunResponse(
        id=run.id,
        source_id=run.source_id,
        provider=run.provider,
        status=run.status,
        started_at=run.started_at,
        finished_at=run.finished_at,
        items_seen=run.items_seen,
        items_stored=run.items_stored,
        alerts_created=run.alerts_created,
        rate_limit_used=float(run.rate_limit_used) if run.rate_limit_used else None,
        rate_limit_remaining=float(run.rate_limit_remaining) if run.rate_limit_remaining else None,
        rate_limit_reset_seconds=run.rate_limit_reset_seconds,
        error_message=run.error_message,
    )


@router.get("/alerts", response_model=list[TlachiaAlertResponse])
def list_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "electoral_analyst")),
) -> list[TlachiaAlertResponse]:
    alerts = db.scalars(
        select(TlachiaAlert)
        .order_by(TlachiaAlert.detected_at.desc())
    ).all()
    return [_alert_response(a) for a in alerts]


@router.get("/alerts/{alert_id}", response_model=TlachiaAlertResponse)
def get_alert(
    alert_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "electoral_analyst")),
) -> TlachiaAlertResponse:
    alert = db.scalar(select(TlachiaAlert).where(TlachiaAlert.id == alert_id))
    if alert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta no encontrada.")
    return _alert_response(alert)


@router.post("/alerts/{alert_id}/review", response_model=TlachiaAlertReviewResponse)
def review_alert(
    alert_id: UUID,
    request: TlachiaAlertReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "electoral_analyst")),
) -> TlachiaAlertReviewResponse:
    alert = db.scalar(select(TlachiaAlert).where(TlachiaAlert.id == alert_id))
    if alert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta no encontrada.")
    alert.review_status = "reviewed"
    db.commit()
    db.refresh(alert)
    _audit(
        db=db,
        action="tlachia.alert.review",
        outcome="success",
        actor_user_id=current_user.id,
        entity_id=str(alert.id),
        metadata={"notes": request.review_notes},
    )
    return TlachiaAlertReviewResponse(
        id=alert.id,
        alert_code=alert.alert_code,
        review_status=alert.review_status,
        message="Alerta marcada como revisada.",
    )


@router.post("/alerts/{alert_id}/dismiss", response_model=TlachiaAlertReviewResponse)
def dismiss_alert(
    alert_id: UUID,
    request: TlachiaAlertReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "electoral_analyst")),
) -> TlachiaAlertReviewResponse:
    alert = db.scalar(select(TlachiaAlert).where(TlachiaAlert.id == alert_id))
    if alert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta no encontrada.")
    alert.review_status = "dismissed"
    db.commit()
    db.refresh(alert)
    _audit(
        db=db,
        action="tlachia.alert.dismiss",
        outcome="success",
        actor_user_id=current_user.id,
        entity_id=str(alert.id),
        metadata={"notes": request.review_notes},
    )
    return TlachiaAlertReviewResponse(
        id=alert.id,
        alert_code=alert.alert_code,
        review_status=alert.review_status,
        message="Alerta descartada.",
    )


@router.post("/alerts/{alert_id}/escalate", response_model=TlachiaAlertReviewResponse)
def escalate_alert(
    alert_id: UUID,
    request: TlachiaAlertReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "electoral_analyst")),
) -> TlachiaAlertReviewResponse:
    alert = db.scalar(select(TlachiaAlert).where(TlachiaAlert.id == alert_id))
    if alert is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta no encontrada.")
    alert.review_status = "escalated"
    db.commit()
    db.refresh(alert)
    _audit(
        db=db,
        action="tlachia.alert.escalate",
        outcome="success",
        actor_user_id=current_user.id,
        entity_id=str(alert.id),
        metadata={"notes": request.review_notes},
    )
    return TlachiaAlertReviewResponse(
        id=alert.id,
        alert_code=alert.alert_code,
        review_status=alert.review_status,
        message="Alerta escalada.",
    )
