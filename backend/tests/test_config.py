from app.core.config import get_settings


def test_empty_frontend_url_uses_dev_default(monkeypatch) -> None:
    monkeypatch.setenv("FRONTEND_URL", "")
    get_settings.cache_clear()

    settings = get_settings()

    assert settings.frontend_url == "http://localhost:3001"

    get_settings.cache_clear()
