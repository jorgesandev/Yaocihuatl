from app.schemas.chimalli import ChimalliCaseInput, MockIntegrationInput
from app.services.chimalli.case_service import ChimalliCaseService


DEMO_NARRATIVE = (
    "Soy candidata a regidora en Mexicali, Baja California. Desde ayer varias "
    "cuentas en redes sociales comenzaron a publicar mensajes diciendo que no "
    "tengo capacidad para ocupar un cargo porque soy mujer, que debería quedarme "
    "en mi casa y que mi candidatura es una vergüenza. Algunas publicaciones "
    "incluyen imágenes editadas de mí y etiquetas relacionadas con mi campaña. "
    "Me preocupa que esto afecte mi participación en la elección y mi seguridad."
)


def test_demo_narrative_generates_possible_vpmrg_case() -> None:
    service = ChimalliCaseService()
    case_input = ChimalliCaseInput(
        narrative=DEMO_NARRATIVE,
        integration=MockIntegrationInput(
            tlachia_alert_id="mock-alert-001",
            source_platform="X",
            risk_level="high",
            machiyotl_evidence_hashes=["sha256:mocked-evidence-hash"],
            evidence_status="sealed_mock",
        ),
    )

    case = service.create_case(case_input)

    assert case.case_id.startswith("CHM-")
    assert case.victim.role == "candidata"
    assert case.victim.position == "regiduria"
    assert case.victim.state == "Baja California"
    assert case.victim.municipality == "Mexicali"
    assert case.facts.platform == "X"
    assert case.vpmrg_test.political_electoral_link.meets is True
    assert case.vpmrg_test.gender_element.meets is True
    assert case.vpmrg_test.political_rights_impact.meets is True
    assert case.vpmrg_test.overall_result == "possible_vpmrg"
    assert case.vpmrg_test.confidence == "medium"
    assert case.jurisdiction.suggested_authority == "IEEBC / UTCE"
    assert case.jurisdiction.procedure == "Procedimiento Especial Sancionador"
    assert case.status == "draft"
    assert case.integration is not None
    assert case.integration.evidence_status == "sealed_mock"
    assert "revisión humana" in case.human_review_notice.lower()


def test_expediente_html_is_a_review_draft_not_an_automatic_complaint() -> None:
    service = ChimalliCaseService()
    case = service.create_case(ChimalliCaseInput(narrative=DEMO_NARRATIVE))

    expediente = service.generate_expediente_html(case.case_id)

    assert "Borrador para revisión humana" in expediente.html
    assert "No constituye denuncia automática" in expediente.html
    assert "IEEBC / UTCE" in expediente.html
    assert expediente.case_id == case.case_id
