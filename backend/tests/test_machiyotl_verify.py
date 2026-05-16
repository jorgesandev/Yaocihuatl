from fastapi.testclient import TestClient
import hashlib

from app.db.models import MachiyotlHashVerification
from app.db.session import create_session
from app.main import app
from sqlalchemy import select
from tests.db_test_utils import migrate_and_seed_database


DEMO_CONTENT = (
    "Contenido sintético de evidencia demo. "
    "No contiene datos reales ni capturas sensibles."
)


def _demo_hash() -> str:
    return hashlib.sha256(DEMO_CONTENT.encode()).hexdigest()


def _demo_short_hash() -> str:
    return _demo_hash()[:12]


def test_verify_existing_hash_returns_match():
    migrate_and_seed_database()
    client = TestClient(app)

    response = client.get(f"/api/v1/machiyotl/verify/{_demo_hash()}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["result"] == "match"
    assert payload["evidence_id"] is not None
    assert payload["sealed_at"] is not None
    assert payload["short_hash"] == _demo_short_hash()
    assert "sintéticos" in payload["warning"]
    assert "validez legal" in payload["warning"]


def test_verify_existing_short_hash_returns_match():
    migrate_and_seed_database()
    client = TestClient(app)

    response = client.get(f"/api/v1/machiyotl/verify/{_demo_short_hash()}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["result"] == "match"


def test_verify_nonexistent_hash_returns_not_found():
    migrate_and_seed_database()
    client = TestClient(app)

    fake_hash = "a" * 64
    response = client.get(f"/api/v1/machiyotl/verify/{fake_hash}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["result"] == "evidence_not_found"
    assert payload["evidence_id"] is None
    assert payload["sealed_at"] is None
    assert "sintéticos" in payload["warning"]


def test_verify_invalid_hash_returns_400():
    migrate_and_seed_database()
    client = TestClient(app)

    response = client.get("/api/v1/machiyotl/verify/not-a-valid-hash!!!")

    assert response.status_code == 400
    payload = response.json()
    assert payload["detail"]["code"] == "invalid_hash"


def test_verify_hash_with_sha256_prefix():
    migrate_and_seed_database()
    client = TestClient(app)

    response = client.get(f"/api/v1/machiyotl/verify/sha256:{_demo_hash()}")

    assert response.status_code == 200
    assert response.json()["result"] == "match"


def test_verify_records_verification_in_db():
    migrate_and_seed_database()
    client = TestClient(app)

    client.get(f"/api/v1/machiyotl/verify/{_demo_hash()}")
    client.get("/api/v1/machiyotl/verify/" + "b" * 64)

    with create_session() as db:
        verifications = db.scalars(select(MachiyotlHashVerification)).all()
        assert len(verifications) >= 2
        results = {v.result for v in verifications}
        assert "match" in results
        assert "evidence_not_found" in results
