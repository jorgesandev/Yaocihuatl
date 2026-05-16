from app.schemas.chimalli import ChimalliCaseContext, ChimalliCaseInput, MachiyotlEvidenceReference
from app.services.chimalli.case_service import ChimalliCaseService


DEMO_NARRATIVE = (
    "Soy candidata a regidora en Mexicali, Baja California. Desde ayer varias "
    "cuentas en redes sociales comenzaron a publicar mensajes diciendo que no "
    "tengo capacidad para ocupar un cargo porque soy mujer, que deberia quedarme "
    "en mi casa y que mi candidatura es una verguenza. Algunas publicaciones "
    "incluyen imagenes editadas de mi y etiquetas relacionadas con mi campaña. "
    "Me preocupa que esto afecte mi participacion en la eleccion y mi seguridad."
)


def test_demo_narrative_generates_possible_vpmrg_case() -> None:
    service = ChimalliCaseService()
    case_input = ChimalliCaseInput(
        narrative=DEMO_NARRATIVE,
        context=ChimalliCaseContext(
            tlachia_alert=None,
            machiyotl_evidence=[
                MachiyotlEvidenceReference(
                    evidence_id="demo-evidence-001",
                    evidence_hash="sha256:demo-evidence-hash",
                    source_platform="X",
                    custody_status="sealed_local",
                    evidence_type="screenshot",
                    authorized_notes="Captura de pantalla adjunta por la persona protegida",
                )
            ],
            source_platform="X",
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
    assert case.status == "intake_pending_review"
    assert case.context is not None
    assert case.context.machiyotl_evidence[0].custody_status == "sealed_local"
    assert "revision humana" in case.human_review_notice.lower()


def test_expediente_html_is_a_review_draft_not_an_automatic_complaint() -> None:
    service = ChimalliCaseService()
    case = service.create_case(ChimalliCaseInput(narrative=DEMO_NARRATIVE))

    expediente = service.generate_expediente_html(case.case_id)

    assert "Borrador para revision humana" in expediente.html
    assert "No constituye denuncia automatica" in expediente.html
    assert "IEEBC / UTCE" in expediente.html
    assert expediente.case_id == case.case_id
    assert expediente.case.case_id == case.case_id
    assert expediente.case.human_review_notice == case.human_review_notice
