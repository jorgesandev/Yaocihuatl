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
        lambda messages, max_tokens=700, **kwargs: _mock_llm_response(),
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
    assert payload["attachments"] == []
    assert "revisión humana" in payload["case"]["human_review_notice"].lower()
    assert "denuncias automáticamente" in payload["reply"]


def test_chimalli_expediente_endpoint_returns_html_draft(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.llm_service,
        "complete",
        lambda messages, max_tokens=700, **kwargs: _mock_llm_response(),
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


def test_chimalli_chat_continues_case_with_message_history(monkeypatch) -> None:
    captured_calls = []

    def _capture_llm_response(messages, max_tokens=700, **kwargs) -> LlmResult:
        captured_calls.append(messages)
        return _mock_llm_response()

    monkeypatch.setattr(chimalli.llm_service, "complete", _capture_llm_response)
    client = TestClient(app)

    first_response = client.post("/api/v1/chimalli/chat", json={"message": DEMO_NARRATIVE})
    assert first_response.status_code == 200
    case_id = first_response.json()["case"]["case_id"]

    second_response = client.post(
        "/api/v1/chimalli/chat",
        json={"case_id": case_id, "message": "También empezaron a etiquetar a mi equipo."},
    )

    assert second_response.status_code == 200
    payload = second_response.json()
    assert payload["case"]["case_id"] == case_id
    assert "También empezaron" in payload["case"]["facts"]["narrative"]
    assert len(payload["case"]["messages"]) >= 4
    assert payload["case"]["messages"][-2]["role"] == "user"
    assert payload["case"]["messages"][-1]["role"] == "assistant"
    assert any(message.content == DEMO_NARRATIVE for message in captured_calls[-1])


def test_chimalli_chat_sanitizes_fuentes_from_reply(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.llm_service,
        "complete",
        lambda messages, max_tokens=700, **kwargs: LlmResult(
            content=(
                "He analizado tu narrativa. Parece que hay elementos preliminares de VPMRG.\n\n"
                "Fuentes consultadas:\n"
                "- LGAMVLV.md, pagina 4: Art. 20 Bis...\n"
                "- Protocolo INE 2024"
            ),
            provider="test",
            model="test-model",
            demo_mode=False,
        ),
    )
    client = TestClient(app)
    response = client.post("/api/v1/chimalli/chat", json={"message": DEMO_NARRATIVE})
    assert response.status_code == 200
    reply = response.json()["reply"]
    assert "fuentes consultadas" not in reply.lower()
    assert "protocolo ine 2024" not in reply.lower()
    assert "elementos preliminares" in reply.lower()


def test_chimalli_chat_sanitizes_markdown_fuentes_from_reply(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.llm_service,
        "complete",
        lambda messages, max_tokens=700, **kwargs: LlmResult(
            content=(
                "He analizado tu narrativa. Parece que hay elementos preliminares de VPMRG.\n\n"
                "**Fuentes consultadas:**\n"
                "- LGAMVLV.md, pagina 4: Art. 20 Bis...\n"
                "- Protocolo INE 2024"
            ),
            provider="test",
            model="test-model",
            demo_mode=False,
        ),
    )
    client = TestClient(app)
    response = client.post("/api/v1/chimalli/chat", json={"message": DEMO_NARRATIVE})
    assert response.status_code == 200
    reply = response.json()["reply"]
    assert "fuentes consultadas" not in reply.lower()
    assert "protocolo ine 2024" not in reply.lower()
    assert "elementos preliminares" in reply.lower()


def test_chimalli_extract_detects_name_and_platform(monkeypatch) -> None:
    narrative = (
        "Hola, me llamo Daniela, soy diputada en Hermosillo. "
        "Estoy recibiendo mensajes de 'mátate' en Reddit."
    )
    client = TestClient(app)
    response = client.post("/api/v1/chimalli/extract", json={"narrative": narrative})
    assert response.status_code == 200
    payload = response.json()
    assert payload["victim"]["name"] == "Daniela"
    assert payload["victim"]["role"] == "diputada"
    assert payload["victim"]["state"] == "Sonora"
    assert payload["victim"]["municipality"] == "Hermosillo"
    assert payload["facts"]["platform"] == "Reddit"
