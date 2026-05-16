from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import text

from app.db.session import create_session
from tests.db_test_utils import migrate_database


ALEMBIC_VERSION_NUM_LIMIT = 32


def test_migration_revision_ids_fit_alembic_version_table() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    config = Config(str(backend_dir / "alembic.ini"))
    script = ScriptDirectory.from_config(config)

    revisions = list(script.walk_revisions())

    assert revisions
    for revision in revisions:
        assert len(revision.revision) <= ALEMBIC_VERSION_NUM_LIMIT
        if revision.down_revision is None:
            continue
        down_revisions = (
            revision.down_revision
            if isinstance(revision.down_revision, tuple)
            else (revision.down_revision,)
        )
        for down_revision in down_revisions:
            assert len(down_revision) <= ALEMBIC_VERSION_NUM_LIMIT


def test_initial_migration_creates_platform_schemas_and_tables() -> None:
    migrate_database()
    with create_session() as db:
        tables = db.execute(
            text(
                """
                select schemaname, tablename
                from pg_tables
                where schemaname in ('iam', 'core', 'tlachia', 'machiyotl', 'chimalli', 'observatory', 'audit')
                """
            )
        ).all()

    table_names = {f"{schema}.{table}" for schema, table in tables}
    assert "iam.users" in table_names
    assert "core.cases" in table_names
    assert "tlachia.sources" in table_names
    assert "tlachia.ingestion_runs" in table_names
    assert "tlachia.platform_items" in table_names
    assert "tlachia.alerts" in table_names
    assert "machiyotl.evidence_items" in table_names
    assert "chimalli.rag_sources" in table_names
    assert "observatory.aggregate_metrics" in table_names
    assert "audit.audit_log" in table_names
