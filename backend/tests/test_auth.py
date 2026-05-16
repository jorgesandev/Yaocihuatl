from fastapi.testclient import TestClient

from app.db.session import create_session
from app.main import app
from app.seed.demo_data import seed_demo_data
from tests.db_test_utils import migrate_database


DEMO_PASSWORD = "electoral"
DEMO_USERNAME = "analista"


def setup_module() -> None:
    migrate_database()
    with create_session() as db:
        seed_demo_data(db)


def _login(client: TestClient) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": DEMO_USERNAME, "password": DEMO_PASSWORD},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_login_success() -> None:
    client = TestClient(app)
    response = client.post(
        "/api/v1/auth/login",
        json={"username": DEMO_USERNAME, "password": DEMO_PASSWORD},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert payload["user"]["username"] == DEMO_USERNAME
    assert any(role["code"] == "electoral_analyst" for role in payload["user"]["roles"])


def test_login_failure_is_auditable() -> None:
    client = TestClient(app)
    response = client.post(
        "/api/v1/auth/login",
        json={"username": DEMO_USERNAME, "password": "wrong"},
    )
    assert response.status_code == 401


def test_me_with_valid_token() -> None:
    client = TestClient(app)
    token = _login(client)
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["username"] == DEMO_USERNAME


def test_logout_invalidates_session() -> None:
    client = TestClient(app)
    token = _login(client)
    logout_response = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_response.status_code == 200
    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 401


def test_change_password_requires_token_and_current_password() -> None:
    client = TestClient(app)
    token = _login(client)
    response = client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": DEMO_PASSWORD, "new_password": "nuevaSegura123"},
    )
    assert response.status_code == 200
    assert "actualizada" in response.json()["message"].lower()

    login_old = client.post(
        "/api/v1/auth/login",
        json={"username": DEMO_USERNAME, "password": DEMO_PASSWORD},
    )
    assert login_old.status_code == 401

    login_new = client.post(
        "/api/v1/auth/login",
        json={"username": DEMO_USERNAME, "password": "nuevaSegura123"},
    )
    assert login_new.status_code == 200

    client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {login_new.json()['access_token']}"},
        json={"current_password": "nuevaSegura123", "new_password": DEMO_PASSWORD},
    )


def test_change_password_with_wrong_current_password() -> None:
    client = TestClient(app)
    token = _login(client)
    response = client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"current_password": "wrong", "new_password": "nuevaSegura123"},
    )
    assert response.status_code == 401
