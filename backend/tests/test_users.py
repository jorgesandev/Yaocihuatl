from fastapi.testclient import TestClient

from app.db.session import create_session
from app.main import app
from app.seed.demo_data import seed_demo_data
from tests.db_test_utils import migrate_database


ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
ANALYST_USERNAME = "analista"
ANALYST_PASSWORD = "electoral"


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


def test_admin_can_create_user() -> None:
    client = TestClient(app)
    token = _login(client, ADMIN_USERNAME, ADMIN_PASSWORD)
    response = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "username": "nueva_analista",
            "display_name": "Nueva Analista",
            "password": "segura1234",
            "role_codes": ["electoral_analyst"],
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["username"] == "nueva_analista"
    assert any(role["code"] == "electoral_analyst" for role in payload["roles"])


def test_analyst_cannot_create_user() -> None:
    client = TestClient(app)
    token = _login(client, ANALYST_USERNAME, ANALYST_PASSWORD)
    response = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "username": "otro",
            "display_name": "Otro",
            "password": "segura1234",
            "role_codes": [],
        },
    )
    assert response.status_code == 403


def test_disabled_user_cannot_login() -> None:
    client = TestClient(app)
    admin_token = _login(client, ADMIN_USERNAME, ADMIN_PASSWORD)

    create_response = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "username": "temporal",
            "display_name": "Temporal",
            "password": "segura1234",
            "role_codes": ["electoral_analyst"],
        },
    )
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    disable_response = client.post(
        f"/api/v1/users/{user_id}/disable",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert disable_response.status_code == 200

    login_response = client.post(
        "/api/v1/auth/login",
        json={"username": "temporal", "password": "segura1234"},
    )
    assert login_response.status_code == 401


def test_role_change_is_audited() -> None:
    client = TestClient(app)
    admin_token = _login(client, ADMIN_USERNAME, ADMIN_PASSWORD)

    create_response = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "username": "roltest",
            "display_name": "Rol Test",
            "password": "segura1234",
            "role_codes": ["civic_observer"],
        },
    )
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]
    assert any(role["code"] == "civic_observer" for role in create_response.json()["roles"])

    assign_response = client.post(
        f"/api/v1/users/{user_id}/roles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=["electoral_analyst"],
    )
    assert assign_response.status_code == 200
    assert any(role["code"] == "electoral_analyst" for role in assign_response.json()["roles"])

    remove_response = client.delete(
        f"/api/v1/users/{user_id}/roles/electoral_analyst",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert remove_response.status_code == 200
    assert not any(role["code"] == "electoral_analyst" for role in remove_response.json()["roles"])
