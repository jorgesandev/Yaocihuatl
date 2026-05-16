from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import AuditLog, TlachiaIngestionRun, TlachiaRedditItem, TlachiaSource
from app.services.tlachia.alert_service import AlertService
from app.services.tlachia.reddit_client import RedditClient, RedditClientError, RedditRateLimitError
from app.services.tlachia.sanitization import SanitizationService


class IngestionError(Exception):
    pass


class IngestionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.settings = get_settings()
        self.sanitizer = SanitizationService()
        self.alert_service = AlertService(db)

    def run_reddit_ingestion(
        self,
        source_id: UUID,
        actor_user_id: UUID | None = None,
    ) -> TlachiaIngestionRun:
        if not self.settings.tlachia_ingestion_enabled:
            raise IngestionError("Ingesta deshabilitada por configuracion.")

        source = self.db.scalar(select(TlachiaSource).where(TlachiaSource.id == source_id))
        if source is None:
            raise IngestionError("Fuente no encontrada.")

        run = TlachiaIngestionRun(
            source_id=source.id,
            provider="reddit",
            status="started",
            created_by_id=actor_user_id,
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)

        client = RedditClient()
        items_seen = 0
        items_stored = 0
        alerts_created = 0
        rate_headers = {}
        error_message = None

        try:
            subreddit = source.subreddit or ""
            terms = source.query_terms if isinstance(source.query_terms, list) else []
            max_requests = self.settings.reddit_max_requests_per_run
            requests_made = 0

            for term in terms[:max_requests]:
                if requests_made >= max_requests:
                    break
                items, headers = client.search_subreddit(
                    subreddit=subreddit,
                    query=term,
                    limit=25,
                )
                requests_made += 1
                rate_headers = headers
                items_seen += len(items)

                for item in items:
                    existing = self.db.scalar(
                        select(TlachiaRedditItem).where(TlachiaRedditItem.reddit_fullname == item.reddit_fullname)
                    )
                    if existing is not None:
                        continue

                    sanitized = self.sanitizer.sanitize_reddit_item(item)
                    reddit_item = TlachiaRedditItem(
                        source_id=source.id,
                        reddit_fullname=sanitized["reddit_fullname"],
                        subreddit=sanitized["subreddit"],
                        permalink=sanitized["permalink"],
                        item_type=sanitized["item_type"],
                        author_hash=sanitized["author_hash"],
                        sanitized_excerpt=sanitized["sanitized_excerpt"],
                        occurred_at=sanitized["occurred_at"],
                        metadata_json=sanitized["metadata"],
                    )
                    self.db.add(reddit_item)
                    items_stored += 1

                    mention_data = {
                        "sanitized_excerpt": sanitized["sanitized_excerpt"],
                        "metadata": {
                            **sanitized["metadata"],
                            "protected_labels": source.protected_labels if isinstance(source.protected_labels, list) else [],
                        },
                        "occurred_at": sanitized["occurred_at"],
                        "protected_person_label": "desconocido",
                    }
                    alert = self.alert_service.create_alert_from_mention(
                        mention_data=mention_data,
                        source_id=source.id,
                        created_by_id=actor_user_id,
                    )
                    if alert is not None:
                        alerts_created += 1

            run.status = "success"
            source.last_ingested_at = datetime.now(timezone.utc)

        except RedditRateLimitError as exc:
            run.status = "partial_failure"
            error_message = str(exc)
        except RedditClientError as exc:
            run.status = "failure"
            error_message = str(exc)
        except Exception as exc:
            run.status = "failure"
            error_message = f"Error inesperado: {exc}"

        run.finished_at = datetime.now(timezone.utc)
        run.items_seen = items_seen
        run.items_stored = items_stored
        run.alerts_created = alerts_created
        if rate_headers:
            rl = client.parse_rate_limit_headers(rate_headers)
            run.rate_limit_used = Decimal(rl.get("used", 0)) if rl.get("used") else None
            run.rate_limit_remaining = Decimal(rl.get("remaining", 0)) if rl.get("remaining") else None
            run.rate_limit_reset_seconds = int(rl.get("reset", 0)) if rl.get("reset") else None
        if error_message:
            run.error_message = error_message

        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)

        self._audit(run, actor_user_id)
        return run

    def _audit(self, run: TlachiaIngestionRun, actor_user_id: UUID | None = None) -> None:
        self.db.add(
            AuditLog(
                actor_user_id=actor_user_id,
                action="tlachia.ingestion.reddit",
                entity_schema="tlachia",
                entity_table="ingestion_runs",
                entity_id=str(run.id),
                outcome=run.status,
                metadata_json={
                    "items_seen": run.items_seen,
                    "items_stored": run.items_stored,
                    "alerts_created": run.alerts_created,
                    "error": run.error_message,
                },
            )
        )
        self.db.commit()
