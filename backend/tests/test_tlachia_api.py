from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.db.models import TlachiaAlert, TlachiaSource
from app.db.session import create_session
from app.main import app
from app.seed.demo_data import seed_demo_data
from tests.db_test_utils import migrate_database


ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
ANALYST_USERNAME = "analista"
ANALYST_PASSWORD = "electoral"
OBSERVER_USERNAME = "observador"
OBSERVER_PASSWORD = "ciudadana"


def setup_module() -> None:
    migrate_database()
    with create_session() as db:
        seed_demo_data(db)


def _login(client: TestClient, username: str, password: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_no_token_returns_401() -> None:
    client = TestClient(app)
    response = client.get("/api/v1/tlachia/sources")
    assert response.status_code == 401


def test_wrong_role_returns_403() -> None:
    client = TestClient(app)
    token = _login(client, OBSERVER_USERNAME, OBSERVER_PASSWORD)
    response = client.get(
        "/api/v1/tlachia/sources",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_admin_creates_source() -> None:
    client = TestClient(app)
    token = _login(client, ADMIN_USERNAME, ADMIN_PASSWORD)
    response = client.post(
        "/api/v1/tlachia/sources",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Test X",
            "platform": "x",
            "scenario": "campaign-burst-demo",
            "fixture_file": "x-search.json",
            "query_terms": ["candidata", "eleccion"],
            "protected_labels": ["candidata_a"],
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["name"] == "Test X"
    assert payload["platform"] == "x"


def test_analyst_can_review_alert() -> None:
    client = TestClient(app)
    token = _login(client, ANALYST_USERNAME, ANALYST_PASSWORD)

    with create_session() as db:
        source = TlachiaSource(
            id=uuid4(),
            name="demo",
            source_type="synthetic",
            platform="x",
            scenario="campaign-burst-demo",
            fixture_file="x-search.json",
            status="active",
        )
        db.add(source)
        alert = TlachiaAlert(
            id=uuid4(),
            alert_code="TLA-DEMO01",
            protected_person_label="demo",
            platform="x",
            risk_level="medium",
            risk_score=50,
            suggested_status="requiere revision humana",
            motive="demo",
            detected_at=datetime.now(timezone.utc),
            review_status="pending_human_review",
        )
        db.add(alert)
        db.commit()
        alert_id = str(alert.id)

    review_response = client.post(
        f"/api/v1/tlachia/alerts/{alert_id}/review",
        headers={"Authorization": f"Bearer {token}"},
        json={"review_notes": "Revisada"},
    )
    assert review_response.status_code == 200
    assert review_response.json()["review_status"] == "reviewed"

    dismiss_response = client.post(
        f"/api/v1/tlachia/alerts/{alert_id}/dismiss",
        headers={"Authorization": f"Bearer {token}"},
        json={},
    )
    assert dismiss_response.status_code == 200
    assert dismiss_response.json()["review_status"] == "dismissed"
