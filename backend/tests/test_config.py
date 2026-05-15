from app.core.config import get_settings


def test_empty_frontend_url_uses_dev_default(monkeypatch) -> None:
    monkeypatch.setenv("FRONTEND_URL", "")
    get_settings.cache_clear()

    settings = get_settings()

    assert settings.frontend_url == "http://localhost:3000"

    get_settings.cache_clear()


def test_database_demo_defaults(monkeypatch) -> None:
    monkeypatch.delenv("RUN_MIGRATIONS_ON_START", raising=False)
    monkeypatch.delenv("SEED_DEMO_DATA", raising=False)
    monkeypatch.delenv("ACCESS_TOKEN_EXPIRE_MINUTES", raising=False)
    get_settings.cache_clear()

    settings = get_settings()

    assert settings.run_migrations_on_start is True
    assert settings.seed_demo_data is True
    assert settings.access_token_expire_minutes == 480

    get_settings.cache_clear()
