from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db.models import AuditLog, CoreCase, MachiyotlEvidenceItem, ObservatoryAggregateMetric, User
from app.db.session import create_session
from app.main import app
from app.seed.demo_data import seed_demo_data
from tests.db_test_utils import migrate_and_seed_database


DEMO_LOGINS = [
    ("mujer", "protegida", "protected_user"),
    ("analista", "electoral", "electoral_analyst"),
    ("revisor", "juzgadora", "judicial_reviewer"),
    ("observador", "ciudadana", "civic_observer"),
]


def test_demo_users_can_login_and_call_me() -> None:
    migrate_and_seed_database()
    client = TestClient(app)

    for username, password, role_code in DEMO_LOGINS:
        response = client.post("/api/v1/auth/login", json={"username": username, "password": password})

        assert response.status_code == 200
        payload = response.json()
        assert payload["token_type"] == "bearer"
        assert payload["user"]["username"] == username
        assert role_code in [role["code"] for role in payload["user"]["roles"]]

        me_response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {payload['access_token']}"},
        )

        assert me_response.status_code == 200
        assert me_response.json()["username"] == username


def test_login_failure_is_audited() -> None:
    migrate_and_seed_database()
    client = TestClient(app)

    response = client.post("/api/v1/auth/login", json={"username": "mujer", "password": "incorrecta"})

    assert response.status_code == 401
    with create_session() as db:
        audit_log = db.scalar(
            select(AuditLog).where(
                AuditLog.action == "auth.login",
                AuditLog.outcome == "failure",
                AuditLog.metadata_json["username"].as_string() == "mujer",
            )
        )
        assert audit_log is not None


def test_demo_seed_is_idempotent_for_core_records() -> None:
    migrate_and_seed_database()
    with create_session() as db:
        seed_demo_data(db)
        seed_demo_data(db)
        demo_users = db.scalars(select(User).where(User.is_demo.is_(True))).all()
        demo_cases = db.scalars(select(CoreCase).where(CoreCase.case_code == "YAO-2026-DEMO-001")).all()
        demo_evidence = db.scalars(
            select(MachiyotlEvidenceItem).where(MachiyotlEvidenceItem.evidence_code == "EVD-2026-DEMO-001")
        ).all()
        public_metrics = db.scalars(select(ObservatoryAggregateMetric)).all()

    assert len(demo_users) == 4
    assert len(demo_cases) == 1
    assert len(demo_evidence) == 1
    assert len(public_metrics) >= 3
