from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import TlachiaRedditItem


class RetentionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.retention_hours = get_settings().tlachia_retention_hours

    def apply_retention(self) -> int:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=self.retention_hours)
        result = self.db.execute(
            delete(TlachiaRedditItem)
            .where(TlachiaRedditItem.created_at < cutoff)
            .where(TlachiaRedditItem.content_deleted_at.is_(None))
        )
        self.db.commit()
        return result.rowcount

    def mark_deleted_content(self, reddit_fullname: str) -> None:
        item = self.db.scalar(
            select(TlachiaRedditItem).where(TlachiaRedditItem.reddit_fullname == reddit_fullname)
        )
        if item is not None:
            item.content_deleted_at = datetime.now(timezone.utc)
            item.sanitized_excerpt = "[eliminado]"
            self.db.commit()
