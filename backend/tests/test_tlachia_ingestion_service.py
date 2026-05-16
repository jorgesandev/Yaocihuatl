from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from uuid import uuid4

from app.db.models import TlachiaIngestionRun, TlachiaSource
from app.db.session import create_session
from app.services.tlachia.ingestion_service import IngestionService
from tests.db_test_utils import migrate_database


def setup_module() -> None:
    migrate_database()


@patch("app.services.tlachia.ingestion_service.RedditClient")
@patch("app.services.tlachia.ingestion_service.get_settings")
def test_successful_run_saves_run_success(mock_settings, mock_client_class) -> None:
    mock_settings.return_value = MagicMock(
        tlachia_ingestion_enabled=True,
        reddit_max_requests_per_run=10,
    )
    mock_client = MagicMock()
    mock_client.search_subreddit.return_value = (
        [],
        {"x-ratelimit-used": "1", "x-ratelimit-remaining": "99", "x-ratelimit-reset": "600"},
    )
    mock_client.parse_rate_limit_headers.return_value = {"used": "1", "remaining": "99", "reset": "600"}
    mock_client_class.return_value = mock_client

    with create_session() as db:
        source = TlachiaSource(
            id=uuid4(),
            name="test",
            subreddit="test",
            query_terms=["test"],
            status="active",
        )
        db.add(source)
        db.commit()

        svc = IngestionService(db)
        run = svc.run_reddit_ingestion(source_id=source.id)
        assert run.status == "success"
        assert run.items_seen == 0
        assert run.items_stored == 0
        assert run.alerts_created == 0


@patch("app.services.tlachia.ingestion_service.RedditClient")
@patch("app.services.tlachia.ingestion_service.get_settings")
def test_run_with_error_saves_failure(mock_settings, mock_client_class) -> None:
    mock_settings.return_value = MagicMock(
        tlachia_ingestion_enabled=True,
        reddit_max_requests_per_run=10,
    )
    mock_client = MagicMock()
    from app.services.tlachia.reddit_client import RedditClientError
    mock_client.search_subreddit.side_effect = RedditClientError("Reddit down")
    mock_client_class.return_value = mock_client

    with create_session() as db:
        source = TlachiaSource(
            id=uuid4(),
            name="test",
            subreddit="test",
            query_terms=["test"],
            status="active",
        )
        db.add(source)
        db.commit()

        svc = IngestionService(db)
        run = svc.run_reddit_ingestion(source_id=source.id)
        assert run.status == "failure"
        assert "Reddit down" in (run.error_message or "")


@patch("app.services.tlachia.ingestion_service.get_settings")
def test_ingestion_disabled_raises_error(mock_settings) -> None:
    mock_settings.return_value = MagicMock(tlachia_ingestion_enabled=False)
    with create_session() as db:
        svc = IngestionService(db)
        try:
            svc.run_reddit_ingestion(source_id=uuid4())
            assert False, "Expected IngestionError"
        except Exception as exc:
            assert "deshabilitada" in str(exc).lower()
