from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.db.models import TlachiaPlatformItem
from app.db.session import create_session
from app.services.tlachia.retention_service import RetentionService
from tests.db_test_utils import migrate_database


def setup_module() -> None:
    migrate_database()


def test_retention_deletes_old_items() -> None:
    with create_session() as db:
        old_item = TlachiaPlatformItem(
            id=uuid4(),
            synthetic_id="old_demo",
            platform="x",
            source_kind="post",
            created_at=datetime.now(timezone.utc) - timedelta(hours=72),
        )
        new_item = TlachiaPlatformItem(
            id=uuid4(),
            synthetic_id="new_demo",
            platform="x",
            source_kind="post",
            created_at=datetime.now(timezone.utc) - timedelta(hours=1),
        )
        db.add(old_item)
        db.add(new_item)
        db.commit()

        svc = RetentionService(db)
        deleted = svc.apply_retention()
        assert deleted >= 1

        remaining = db.query(TlachiaPlatformItem).all()
        assert all(item.synthetic_id != "old_demo" for item in remaining)
