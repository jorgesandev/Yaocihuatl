from fastapi.testclient import TestClient

from app.api.v1 import chimalli
from app.main import app
from app.schemas.chimalli import ChimalliCaseContext, LlmResult, MachiyotlEvidenceReference


DEMO_NARRATIVE = (
    "Soy candidata a regidora en Mexicali, Baja California. Desde ayer varias cuentas "
    "publicaron que no tengo capacidad porque soy mujer y que deberia quedarme en mi casa. "
    "Me preocupa que esto afecte mi participacion en la eleccion."
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
            "context": {
                "machiyotl_evidence": [
                    {
                        "evidence_id": "demo-evidence-001",
                        "evidence_hash": "sha256:demo-evidence-hash",
                        "source_platform": "X",
                        "custody_status": "sealed_local",
                        "evidence_type": "screenshot",
                        "authorized_notes": "Captura adjunta",
                    }
                ],
                "source_platform": "X",
            },
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["case"]["vpmrg_test"]["overall_result"] == "possible_vpmrg"
    assert payload["case"]["jurisdiction"]["suggested_authority"] == "IEEBC / UTCE"
    assert payload["attachments"] == []
    assert "revision humana" in payload["case"]["human_review_notice"].lower()
    assert "denuncias automaticamente" in payload["reply"]


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
    assert payload["case"]["case_id"] == case_id
    assert payload["case"]["human_review_notice"]
    assert "Borrador para revision humana" in payload["html"]
    assert "No constituye denuncia automatica" in payload["html"]


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
        json={"case_id": case_id, "message": "Tambien empezaron a etiquetar a mi equipo."},
    )

    assert second_response.status_code == 200
    payload = second_response.json()
    assert payload["case"]["case_id"] == case_id
    assert "Tambien empezaron" in payload["case"]["facts"]["narrative"]
    assert len(payload["case"]["messages"]) >= 4
    assert payload["case"]["messages"][-2]["role"] == "user"
    assert payload["case"]["messages"][-1]["role"] == "assistant"
    assert any(message.content == DEMO_NARRATIVE for message in captured_calls[-1])


def test_chimalli_chat_handles_casual_message_without_reanalysis(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.llm_service,
        "complete",
        lambda messages, max_tokens=700, **kwargs: LlmResult(
            content="Resultado preliminar: no deberia usarse para un saludo.",
            provider="test",
            model="test-model",
            demo_mode=False,
        ),
    )
    client = TestClient(app)
    first_response = client.post("/api/v1/chimalli/chat", json={"message": DEMO_NARRATIVE})
    case_id = first_response.json()["case"]["case_id"]

    response = client.post(
        "/api/v1/chimalli/chat",
        json={"case_id": case_id, "message": "Hola"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert "resultado preliminar" not in payload["reply"].lower()
    assert "hola" in payload["reply"].lower()
    assert payload["case"]["facts"]["narrative"] == DEMO_NARRATIVE


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


def test_chimalli_chat_keeps_llm_reply_with_brackets_and_removes_sources(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.llm_service,
        "complete",
        lambda messages, max_tokens=700, **kwargs: LlmResult(
            content=(
                "Te acompaño con calma [sin enviar nada automaticamente]. Primero podemos ordenar lo ocurrido.\n\n"
                "Fuentes consultadas:\n"
                "- criterios_violencia-digital-genero-tepjf_mexico.pdf, pagina 53"
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
    assert "te acompaño" in reply.lower()
    assert "fuentes consultadas" not in reply.lower()
    assert "criterios_violencia" not in reply.lower()


def test_chimalli_chat_removes_fuentes_recuperadas_from_reply(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.llm_service,
        "complete",
        lambda messages, max_tokens=700, **kwargs: LlmResult(
            content=(
                "Elizabeth, siento que estes recibiendo mensajes asi. Antes de reportar o borrar, "
                "conviene conservar evidencia.\n\n"
                "Fuentes recuperadas:\n"
                "Criterios sobre violencia digital de genero."
            ),
            provider="test",
            model="test-model",
            demo_mode=False,
        ),
    )
    client = TestClient(app)

    response = client.post(
        "/api/v1/chimalli/chat",
        json={
            "message": "Hola, me llamo Elizabeth, soy de Xalapa, me estan llegando mensajes diciendome \"Mátate\" en Facebook"
        },
    )

    assert response.status_code == 200
    reply = response.json()["reply"]
    assert "elizabeth" in reply.lower()
    assert "fuentes recuperadas" not in reply.lower()
    assert "criterios sobre" not in reply.lower()


def test_initial_chat_prompt_does_not_force_dictamen_format(monkeypatch) -> None:
    captured_messages = []
    monkeypatch.setattr(
        chimalli.case_service.llm_service,
        "complete",
        lambda messages, max_tokens=800, **kwargs: LlmResult(
            content="",
            provider="test",
            model="test-model",
            demo_mode=True,
        ),
    )

    def _capture_chat_messages(messages, max_tokens=700, **kwargs) -> LlmResult:
        captured_messages.extend(messages)
        return LlmResult(
            content="Elizabeth, siento que estes recibiendo mensajes asi. ¿Esto se relaciona con una candidatura, cargo o actividad politica?",
            provider="test",
            model="test-model",
            demo_mode=False,
        )

    monkeypatch.setattr(chimalli.llm_service, "complete", _capture_chat_messages)
    client = TestClient(app)

    response = client.post(
        "/api/v1/chimalli/chat",
        json={
            "message": "Hola, me llamo Elizabeth, soy de Xalapa, me estan llegando mensajes diciendome \"Mátate\" en Facebook"
        },
    )

    assert response.status_code == 200
    prompt = "\n".join(message.content for message in captured_messages)
    assert "Resultado preliminar" not in prompt
    assert "Autoridad sugerida" not in prompt
    assert "Elemento 1" not in prompt
    assert "Fuentes recuperadas" not in prompt
    assert "candidatura" in prompt.lower()
    assert "actividad politica" in prompt.lower()


def test_chimalli_extract_detects_name_and_platform(monkeypatch) -> None:
    narrative = (
        "Hola, me llamo Daniela, soy diputada en Hermosillo. "
        "Estoy recibiendo mensajes de 'matate' en Reddit."
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


def test_chimalli_extract_handles_accented_violence_terms_without_role(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.case_service.llm_service,
        "complete",
        lambda messages, max_tokens=800, **kwargs: LlmResult(
            content="",
            provider="test",
            model="test-model",
            demo_mode=True,
        ),
    )
    narrative = (
        "Mi nombre es Daniela, me estan mandando mensajes con la frase "
        "\"mátate\" en Facebook. Soy de Hermosillo."
    )
    client = TestClient(app)

    response = client.post("/api/v1/chimalli/extract", json={"narrative": narrative})

    assert response.status_code == 200
    payload = response.json()
    assert payload["victim"]["name"] == "Daniela"
    assert payload["victim"]["state"] == "Sonora"
    assert payload["victim"]["municipality"] == "Hermosillo"
    assert payload["facts"]["platform"] == "Facebook"
    assert payload["facts"]["narrative"] == narrative


def test_chimalli_extract_infers_xalapa_state_with_accented_phrase(monkeypatch) -> None:
    monkeypatch.setattr(
        chimalli.case_service.llm_service,
        "complete",
        lambda messages, max_tokens=800, **kwargs: LlmResult(
            content="",
            provider="test",
            model="test-model",
            demo_mode=True,
        ),
    )
    narrative = (
        "Hola, me llamo Elizabeth, soy de Xalapa, me estan llegando mensajes "
        "diciendome \"Mátate\" en Facebook."
    )
    client = TestClient(app)

    response = client.post("/api/v1/chimalli/extract", json={"narrative": narrative})

    assert response.status_code == 200
    payload = response.json()
    assert payload["victim"]["name"] == "Elizabeth"
    assert payload["victim"]["state"] == "Veracruz"
    assert payload["victim"]["municipality"] == "Xalapa"
    assert payload["facts"]["platform"] == "Facebook"
