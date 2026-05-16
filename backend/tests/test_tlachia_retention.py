from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.db.models import TlachiaRedditItem
from app.db.session import create_session
from app.services.tlachia.retention_service import RetentionService
from tests.db_test_utils import migrate_database


def setup_module() -> None:
    migrate_database()


def test_retention_deletes_old_items() -> None:
    with create_session() as db:
        old_item = TlachiaRedditItem(
            id=uuid4(),
            reddit_fullname="t3_old",
            item_type="submission",
            subreddit="test",
            created_at=datetime.now(timezone.utc) - timedelta(hours=72),
        )
        new_item = TlachiaRedditItem(
            id=uuid4(),
            reddit_fullname="t3_new",
            item_type="submission",
            subreddit="test",
            created_at=datetime.now(timezone.utc) - timedelta(hours=1),
        )
        db.add(old_item)
        db.add(new_item)
        db.commit()

        svc = RetentionService(db)
        deleted = svc.apply_retention()
        assert deleted >= 1

        remaining = db.query(TlachiaRedditItem).all()
        assert all(item.reddit_fullname != "t3_old" for item in remaining)


def test_mark_deleted_content() -> None:
    with create_session() as db:
        item = TlachiaRedditItem(
            id=uuid4(),
            reddit_fullname="t3_del",
            item_type="submission",
            subreddit="test",
            sanitized_excerpt="original text",
            created_at=datetime.now(timezone.utc),
        )
        db.add(item)
        db.commit()

        svc = RetentionService(db)
        svc.mark_deleted_content("t3_del")

        db.refresh(item)
        assert item.sanitized_excerpt == "[eliminado]"
        assert item.content_deleted_at is not None
