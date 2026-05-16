from unittest.mock import MagicMock, patch

from app.db.session import create_session
from app.services.tlachia.ingestion_service import IngestionService
from tests.db_test_utils import migrate_database


def setup_module() -> None:
    migrate_database()


@patch("app.services.tlachia.ingestion_service.get_settings")
def test_successful_synthetic_run_saves_run_success(mock_settings) -> None:
    mock_settings.return_value = MagicMock(
        tlachia_ingestion_enabled=True,
        tlachia_synthetic_mode=True,
        tlachia_synthetic_platforms="x",
        tlachia_synthetic_fixtures_path="datasets/synthetic/tlachia",
        tlachia_min_alert_score=50,
    )

    with create_session() as db:
        svc = IngestionService(db)
        runs = svc.run_synthetic_ingestion(platforms=["x"])
        assert len(runs) == 1
        assert runs[0].status == "success"
        assert runs[0].provider == "synthetic"
        assert runs[0].platform == "x"
        assert (runs[0].items_seen or 0) > 0


@patch("app.services.tlachia.ingestion_service.get_settings")
def test_ingestion_disabled_raises_error(mock_settings) -> None:
    mock_settings.return_value = MagicMock(tlachia_ingestion_enabled=False)
    with create_session() as db:
        svc = IngestionService(db)
        try:
            svc.run_synthetic_ingestion(platforms=["x"])
            assert False, "Expected IngestionError"
        except Exception as exc:
            assert "deshabilitada" in str(exc).lower()
