from sqlalchemy import text

from app.db.session import create_session
from tests.db_test_utils import migrate_database


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
    assert "tlachia.reddit_items" in table_names
    assert "tlachia.alerts" in table_names
    assert "machiyotl.evidence_items" in table_names
    assert "chimalli.rag_sources" in table_names
    assert "observatory.aggregate_metrics" in table_names
    assert "audit.audit_log" in table_names
