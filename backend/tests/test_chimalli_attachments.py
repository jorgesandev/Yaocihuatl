from fastapi.testclient import TestClient

from app.api.v1 import chimalli
from app.main import app
from app.schemas.chimalli import LlmResult, VisualAnalysis


def _mock_llm_response() -> LlmResult:
    return LlmResult(
        content="Respuesta con adjuntos revisados sin decision automatica.",
        provider="test",
        model="test-model",
        demo_mode=False,
    )


def test_upload_text_attachment_extracts_text() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/v1/chimalli/attachments",
        files={"file": ("relato.txt", b"Soy candidata y publicaron insultos por ser mujer.", "text/plain")},
    )

    assert response.status_code == 200
    attachment = response.json()["attachment"]
    assert attachment["file_name"] == "relato.txt"
    assert attachment["status"] == "text_extracted"
    assert "candidata" in attachment["extracted_text"]
    assert attachment["sha256"].startswith("sha256:")


def test_upload_rejects_unsupported_file_type() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/v1/chimalli/attachments",
        files={"file": ("script.js", b"alert('x')", "application/javascript")},
    )

    assert response.status_code == 400
    assert "Tipo de archivo" in response.json()["detail"]


def test_chat_uses_text_attachment(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.llm_service,
        "complete",
        lambda messages, max_tokens=700: _mock_llm_response(),
    )
    client = TestClient(app)
    upload_response = client.post(
        "/api/v1/chimalli/attachments",
        files={"file": ("captura.txt", b"Mexicali Baja California campana mujer", "text/plain")},
    )
    attachment_id = upload_response.json()["attachment"]["attachment_id"]

    response = client.post(
        "/api/v1/chimalli/chat",
        json={
            "message": "Necesito orientacion sobre esta publicacion.",
            "attachment_ids": [attachment_id],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["attachments"][0]["attachment_id"] == attachment_id
    assert payload["case"]["facts"]["attachments"][0]["status"] == "text_extracted"
    assert payload["case"]["victim"]["municipality"] == "Mexicali"


def test_image_attachment_can_use_mocked_vision(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.attachment_service.vision_service,
        "analyze_image",
        lambda file_path, mime_type: VisualAnalysis(
            visible_text=["No tiene capacidad por ser mujer"],
            platform_indicators=["X"],
            accounts_or_handles=["@cuenta_demo"],
            gendered_or_political_language=["por ser mujer"],
            summary_for_case="Captura con expresion de genero contra candidata.",
        ),
    )
    client = TestClient(app)

    response = client.post(
        "/api/v1/chimalli/attachments",
        files={"file": ("captura.png", b"not-a-real-png-but-accepted-by-mvp", "image/png")},
    )

    assert response.status_code == 200
    attachment = response.json()["attachment"]
    assert attachment["status"] == "image_analyzed"
    assert attachment["visual_summary"] == "Captura con expresion de genero contra candidata."
