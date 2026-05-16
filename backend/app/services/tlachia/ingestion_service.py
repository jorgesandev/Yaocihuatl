from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import AuditLog, TlachiaIngestionRun, TlachiaPlatformItem, TlachiaSource
from app.services.tlachia.alert_service import AlertService
from app.services.tlachia.sanitization import SanitizationService
from app.services.tlachia.synthetic_adapters import ADAPTERS, SyntheticAdapterError


class IngestionError(Exception):
    pass


class IngestionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.settings = get_settings()
        self.sanitizer = SanitizationService()
        self.alert_service = AlertService(db)

    def run_synthetic_ingestion(
        self,
        platforms: list[str] | None = None,
        scenario: str = "campaign-burst-demo",
        actor_user_id: UUID | None = None,
    ) -> list[TlachiaIngestionRun]:
        if not self.settings.tlachia_ingestion_enabled:
            raise IngestionError("Ingesta deshabilitada por configuracion.")
        if not self.settings.tlachia_synthetic_mode:
            raise IngestionError("TLACHIA_SYNTHETIC_MODE debe estar habilitado para el MVP.")

        selected_platforms = platforms or [
            platform.strip()
            for platform in self.settings.tlachia_synthetic_platforms.split(",")
            if platform.strip()
        ]
        if not selected_platforms:
            raise IngestionError("No hay plataformas sinteticas configuradas.")

        runs: list[TlachiaIngestionRun] = []
        for platform in selected_platforms:
            if platform not in ADAPTERS:
                raise IngestionError(f"Plataforma sintetica no soportada: {platform}")
            source = self._get_or_create_source(platform=platform, scenario=scenario, actor_user_id=actor_user_id)
            runs.append(self._run_source(source, actor_user_id=actor_user_id))
        return runs

    def _run_source(
        self,
        source: TlachiaSource,
        actor_user_id: UUID | None = None,
    ) -> TlachiaIngestionRun:
        platform = source.platform or ""
        adapter = ADAPTERS.get(platform)
        if adapter is None:
            raise IngestionError(f"Plataforma sintetica no soportada: {platform}")

        run = TlachiaIngestionRun(
            source_id=source.id,
            provider="synthetic",
            platform=platform,
            scenario=source.scenario,
            status="started",
            created_by_id=actor_user_id,
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)

        items_seen = 0
        items_stored = 0
        alerts_created = 0
        error_message = None

        try:
            fixture_path = self._fixture_path(source)
            items = adapter.fetch_mentions(fixture_path)
            items_seen = len(items)

            for item in items:
                existing = self.db.scalar(
                    select(TlachiaPlatformItem).where(TlachiaPlatformItem.synthetic_id == item.synthetic_id)
                )
                if existing is not None:
                    continue

                sanitized = self.sanitizer.sanitize_platform_mention(item)
                platform_item = TlachiaPlatformItem(
                    source_id=source.id,
                    synthetic_id=sanitized["synthetic_id"],
                    platform=sanitized["platform"],
                    source_kind=sanitized["source_kind"],
                    source_url=sanitized["source_url"],
                    author_hash=sanitized["author_hash"],
                    sanitized_excerpt=sanitized["sanitized_excerpt"],
                    occurred_at=sanitized["occurred_at"],
                    metadata_json=sanitized["metadata"],
                )
                self.db.add(platform_item)
                items_stored += 1

                mention_data = {
                    "sanitized_excerpt": sanitized["sanitized_excerpt"],
                    "metadata": {
                        **sanitized["metadata"],
                        "protected_labels": source.protected_labels if isinstance(source.protected_labels, list) else [],
                    },
                    "occurred_at": sanitized["occurred_at"],
                    "protected_person_label": self._protected_label(source),
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
        except (SyntheticAdapterError, OSError, ValueError) as exc:
            run.status = "failure"
            error_message = str(exc)
        except Exception as exc:
            run.status = "failure"
            error_message = f"Error inesperado: {exc}"

        run.finished_at = datetime.now(timezone.utc)
        run.items_seen = items_seen
        run.items_stored = items_stored
        run.alerts_created = alerts_created
        run.error_message = error_message

        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)

        self._audit(run, actor_user_id)
        return run

    def _get_or_create_source(
        self,
        platform: str,
        scenario: str,
        actor_user_id: UUID | None,
    ) -> TlachiaSource:
        source = self.db.scalar(
            select(TlachiaSource).where(
                TlachiaSource.source_type == "synthetic",
                TlachiaSource.platform == platform,
                TlachiaSource.scenario == scenario,
            )
        )
        if source is not None:
            return source

        adapter = ADAPTERS[platform]
        source = TlachiaSource(
            source_type="synthetic",
            platform=platform,
            name=f"{platform.title()} · {scenario}",
            scenario=scenario,
            fixture_file=adapter.default_fixture,
            query_terms=[],
            protected_labels=["candidata demo", "persona protegida"],
            status="active",
            created_by_id=actor_user_id,
        )
        self.db.add(source)
        self.db.commit()
        self.db.refresh(source)
        return source

    def _fixture_path(self, source: TlachiaSource) -> Path:
        adapter = ADAPTERS[source.platform or ""]
        fixture_file = source.fixture_file or adapter.default_fixture
        configured_path = Path(self.settings.tlachia_synthetic_fixtures_path)
        candidates = [
            configured_path / fixture_file,
            Path.cwd() / configured_path / fixture_file,
            Path.cwd().parent / configured_path / fixture_file,
            Path(__file__).resolve().parents[4] / configured_path / fixture_file,
        ]
        for candidate in candidates:
            if candidate.exists():
                return candidate
        return candidates[0]

    @staticmethod
    def _protected_label(source: TlachiaSource) -> str:
        labels = source.protected_labels if isinstance(source.protected_labels, list) else []
        return labels[0] if labels else "persona protegida demo"

    def _audit(self, run: TlachiaIngestionRun, actor_user_id: UUID | None = None) -> None:
        self.db.add(
            AuditLog(
                actor_user_id=actor_user_id,
                action="tlachia.ingestion.synthetic",
                entity_schema="tlachia",
                entity_table="ingestion_runs",
                entity_id=str(run.id),
                outcome=run.status,
                metadata_json={
                    "platform": run.platform,
                    "scenario": run.scenario,
                    "items_seen": run.items_seen,
                    "items_stored": run.items_stored,
                    "alerts_created": run.alerts_created,
                    "error": run.error_message,
                },
            )
        )
        self.db.commit()
