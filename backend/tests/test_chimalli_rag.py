from pathlib import Path

from app.core.config import Settings
from app.services.chimalli.rag_service import RagService


def test_rag_index_infers_metadata_from_collection_and_filename(tmp_path: Path) -> None:
    documents = tmp_path / "rag_documents"
    legal_core = documents / "01_legal_core"
    procedimiento = documents / "02_procedimiento_ieebc"
    violencia = documents / "03_violencia_digital_genero"
    legal_core.mkdir(parents=True)
    procedimiento.mkdir(parents=True)
    violencia.mkdir(parents=True)
    (legal_core / "legal_ley-electoral-baja-california_bc.md").write_text("campaña mujer candidata", encoding="utf-8")
    (procedimiento / "procedimiento_reglamento-quejas-denuncias-ieebc_bc.md").write_text("procedimiento especial sancionador", encoding="utf-8")
    (violencia / "criterios_violencia-digital-genero-tepjf_mexico.md").write_text("estereotipos de género", encoding="utf-8")
    settings = Settings(
        chimalli_rag_documents_path=str(documents),
        chimalli_rag_index_path=str(tmp_path / "index.jsonl"),
    )
    service = RagService(settings=settings)

    result = service.index_documents()
    legal_source = service.search("candidata campaña", collections=["01_legal_core"]).sources[0]
    procedure_source = service.search("sancionador", collections=["02_procedimiento_ieebc"]).sources[0]
    criteria_source = service.search("estereotipos", collections=["03_violencia_digital_genero"]).sources[0]

    assert result.indexed_chunks == 3
    assert legal_source.document_type == "ley"
    assert legal_source.jurisdiction == "Baja California"
    assert legal_source.institution == "Congreso"
    assert procedure_source.document_type == "reglamento"
    assert procedure_source.institution == "IEEBC"
    assert criteria_source.document_type == "criterio"
    assert criteria_source.institution == "TEPJF"
