from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.db.models import TlachiaAlert, TlachiaAlertSignal, TlachiaSanitizedMention
from app.services.tlachia.risk_rules import RiskRulesEngine, SignalResult


class AlertService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.engine = RiskRulesEngine()

    def create_alert_from_mention(
        self,
        mention_data: dict,
        source_id: UUID | None,
        created_by_id: UUID | None,
    ) -> TlachiaAlert | None:
        text = mention_data.get("sanitized_excerpt", "")
        metadata = mention_data.get("metadata", {})
        prior_alerts_count = metadata.get("prior_alerts_count", 0)

        signals = self.engine.evaluate(text, metadata, prior_alerts_count)
        score = self.engine.compute_score(signals)

        if score < 1:
            return None

        risk_level = self.engine.risk_level_from_score(score)
        alert = TlachiaAlert(
            id=uuid4(),
            alert_code=f"TLA-{uuid4().hex[:8].upper()}",
            protected_person_label=mention_data.get("protected_person_label", "desconocido"),
            platform="reddit",
            risk_level=risk_level,
            risk_score=Decimal(score),
            suggested_status="requiere revision humana",
            motive=text[:500],
            detected_at=datetime.now(timezone.utc),
            review_status="pending_human_review",
            created_by_id=created_by_id,
        )
        self.db.add(alert)
        self.db.flush()

        for signal in signals:
            if signal.matched:
                self.db.add(
                    TlachiaAlertSignal(
                        id=uuid4(),
                        alert_id=alert.id,
                        signal_type=signal.signal_type,
                        label=signal.label,
                        explanation=signal.explanation,
                        weight=Decimal(signal.weight),
                    )
                )

        self.db.add(
            TlachiaSanitizedMention(
                id=uuid4(),
                alert_id=alert.id,
                mention_code=f"TLM-{uuid4().hex[:8].upper()}",
                platform="reddit",
                sanitized_excerpt=text,
                occurred_at=mention_data.get("occurred_at", datetime.now(timezone.utc)),
                metadata_json=metadata,
            )
        )

        self.db.commit()
        self.db.refresh(alert)
        return alert
