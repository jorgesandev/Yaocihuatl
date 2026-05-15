import os
from pathlib import Path

import pytest
from alembic.command import upgrade
from alembic.config import Config

from app.db.session import create_session
from app.seed.demo_data import seed_demo_data


def require_database_url() -> None:
    if not os.getenv("DATABASE_URL"):
        pytest.skip("DATABASE_URL is required for database integration tests.")


def backend_root() -> Path:
    return Path(__file__).resolve().parents[1]


def migrate_database() -> None:
    require_database_url()
    alembic_cfg = Config(str(backend_root() / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(backend_root() / "migrations"))
    upgrade(alembic_cfg, "head")


def migrate_and_seed_database() -> None:
    migrate_database()
    with create_session() as db:
        seed_demo_data(db)
