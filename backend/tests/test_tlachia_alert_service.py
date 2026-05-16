from uuid import uuid4

from app.db.session import create_session
from app.services.tlachia.alert_service import AlertService
from tests.db_test_utils import migrate_database


def setup_module() -> None:
    migrate_database()


def test_no_alert_without_signals() -> None:
    with create_session() as db:
        svc = AlertService(db)
        mention = {"sanitized_excerpt": "hello world", "metadata": {}, "occurred_at": None}
        alert = svc.create_alert_from_mention(mention, source_id=None, created_by_id=None)
        assert alert is None


def test_medium_alert_is_created() -> None:
    with create_session() as db:
        svc = AlertService(db)
        mention = {
            "sanitized_excerpt": "candidata_a es mujer de la casa",
            "metadata": {"protected_labels": ["candidata_a"]},
            "occurred_at": None,
        }
        alert = svc.create_alert_from_mention(mention, source_id=None, created_by_id=None)
        assert alert is not None
        assert alert.risk_level == "medium"
        assert alert.review_status == "pending_human_review"
        assert alert.suggested_status == "requiere revision humana"
        signals = [s for s in alert.alert_signals]
        assert len(signals) >= 1
