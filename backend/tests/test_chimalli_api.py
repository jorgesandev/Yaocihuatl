from fastapi.testclient import TestClient

from app.api.v1 import chimalli
from app.main import app
from app.schemas.chimalli import LlmResult


DEMO_NARRATIVE = (
    "Soy candidata a regidora en Mexicali, Baja California. Desde ayer varias cuentas "
    "publicaron que no tengo capacidad porque soy mujer y que debería quedarme en mi casa. "
    "Me preocupa que esto afecte mi participación en la elección."
)


def _mock_llm_response() -> LlmResult:
    return LlmResult(
        content="Respuesta demo controlada para orientar sin decidir.",
        provider="test",
        model="test-model",
        demo_mode=False,
    )


def test_chimalli_chat_endpoint_returns_structured_case(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.llm_service,
        "complete",
        lambda messages, max_tokens=700: _mock_llm_response(),
    )
    client = TestClient(app)

    response = client.post(
        "/api/v1/chimalli/chat",
        json={
            "message": DEMO_NARRATIVE,
            "integration": {
                "tlachia_alert_id": "mock-alert-001",
                "source_platform": "X",
                "risk_level": "high",
                "machiyotl_evidence_hashes": ["sha256:mocked-evidence-hash"],
                "evidence_status": "sealed_mock",
            },
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["case"]["vpmrg_test"]["overall_result"] == "possible_vpmrg"
    assert payload["case"]["jurisdiction"]["suggested_authority"] == "IEEBC / UTCE"
    assert "revisión humana" in payload["case"]["human_review_notice"].lower()
    assert "denuncias automáticamente" in payload["reply"]


def test_chimalli_expediente_endpoint_returns_html_draft(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.llm_service,
        "complete",
        lambda messages, max_tokens=700: _mock_llm_response(),
    )
    client = TestClient(app)
    chat_response = client.post("/api/v1/chimalli/chat", json={"message": DEMO_NARRATIVE})
    case_id = chat_response.json()["case"]["case_id"]

    response = client.post("/api/v1/chimalli/expediente", json={"case_id": case_id})

    assert response.status_code == 200
    payload = response.json()
    assert payload["case_id"] == case_id
    assert "Borrador para revisión humana" in payload["html"]
    assert "No constituye denuncia automática" in payload["html"]
