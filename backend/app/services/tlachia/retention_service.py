from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import TlachiaPlatformItem


class RetentionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.retention_hours = get_settings().tlachia_retention_hours

    def apply_retention(self) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=self.retention_hours)
        result = self.db.execute(
            delete(TlachiaPlatformItem)
            .where(TlachiaPlatformItem.created_at < cutoff)
        )
        self.db.commit()
        return result.rowcount
