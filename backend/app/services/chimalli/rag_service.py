from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Sequence

from app.core.config import Settings, get_settings
from app.schemas.chimalli import RagIndexResponse, RagSearchResponse, RagSource
from app.services.chimalli.chunking import chunk_text, keyword_score, normalize_text


INTENT_COLLECTIONS: Dict[str, List[str]] = {
    "tipificacion": ["01_legal_core", "03_violencia_digital_genero"],
    "procedimiento": ["02_procedimiento_ieebc", "01_legal_core"],
    "canalizacion": ["02_procedimiento_ieebc", "01_legal_core"],
    "medidas": ["02_procedimiento_ieebc", "04_atencion_victimas"],
    "seguridad": ["02_procedimiento_ieebc", "04_atencion_victimas"],
    "privacidad": ["05_privacidad_datos"],
    "contexto": ["06_contexto_estadistico"],
}


class RagService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def index_documents(self, documents_path: str | None = None) -> RagIndexResponse:
        base_path = Path(documents_path or self.settings.chimalli_rag_documents_path).resolve()
        index_path = Path(self.settings.chimalli_rag_index_path).resolve()
        index_path.parent.mkdir(parents=True, exist_ok=True)

        skipped_files: List[str] = []
        indexed_chunks = 0
        records: List[dict] = []
        if not base_path.exists():
            index_path.write_text("", encoding="utf-8")
            return RagIndexResponse(
                indexed_chunks=0,
                skipped_files=[str(base_path)],
                index_path=str(index_path),
                warning="No existe la carpeta de documentos RAG; se creo un indice vacio.",
            )

        for file_path in sorted(base_path.rglob("*")):
            if not file_path.is_file() or file_path.name.startswith("."):
                continue
            text_by_page = self._read_document(file_path)
            if not text_by_page:
                skipped_files.append(str(file_path))
                continue
            collection = self._collection_for(file_path, base_path)
            for page_number, text in text_by_page.items():
                for chunk in chunk_text(text):
                    record = self._metadata_for(file_path, collection, page_number)
                    record["excerpt"] = chunk
                    record["score"] = 0.0
                    records.append(record)
                    indexed_chunks += 1

        with index_path.open("w", encoding="utf-8") as index_file:
            for record in records:
                index_file.write(json.dumps(record, ensure_ascii=False) + "\n")

        warning = "Indice RAG actualizado con documentos disponibles."
        if skipped_files:
            warning = "Indice RAG actualizado; algunos archivos no pudieron procesarse."
        return RagIndexResponse(
            indexed_chunks=indexed_chunks,
            skipped_files=skipped_files,
            index_path=str(index_path),
            warning=warning,
        )

    def search(
        self,
        query: str,
        intent: str = "tipificacion",
        collections: Sequence[str] | None = None,
        limit: int = 5,
    ) -> RagSearchResponse:
        index_path = Path(self.settings.chimalli_rag_index_path).resolve()
        selected_collections = list(collections or INTENT_COLLECTIONS.get(intent, []))
        if not index_path.exists():
            return RagSearchResponse(
                sources=[],
                warning="No hay indice RAG disponible. Ejecuta la indexacion antes de consultar fuentes.",
            )

        matches: List[RagSource] = []
        with index_path.open("r", encoding="utf-8") as index_file:
            for line in index_file:
                if not line.strip():
                    continue
                record = json.loads(line)
                if selected_collections and record.get("collection") not in selected_collections:
                    continue
                score = keyword_score(query, record.get("excerpt", ""))
                if score <= 0:
                    continue
                record["score"] = round(score, 4)
                matches.append(RagSource.model_validate(record))

        matches.sort(key=lambda source: (source.score, source.priority == "high"), reverse=True)
        warning = "Fuentes recuperadas del corpus local disponible."
        if not matches:
            warning = "No se recuperaron fuentes para esta intencion; no se deben inventar citas."
        return RagSearchResponse(sources=matches[:limit], warning=warning)

    def _read_document(self, file_path: Path) -> Dict[int, str]:
        suffix = file_path.suffix.lower()
        if suffix in {".md", ".txt"}:
            return {1: normalize_text(file_path.read_text(encoding="utf-8", errors="ignore"))}
        if suffix == ".pdf":
            try:
                from pypdf import PdfReader
            except ImportError:
                return {}
            try:
                reader = PdfReader(str(file_path))
                return {
                    index + 1: normalize_text(page.extract_text() or "")
                    for index, page in enumerate(reader.pages)
                }
            except Exception:
                return {}
        return {}

    def _collection_for(self, file_path: Path, base_path: Path) -> str:
        try:
            return file_path.relative_to(base_path).parts[0]
        except ValueError:
            return "unknown"

    def _metadata_for(self, file_path: Path, collection: str, page: int) -> dict:
        file_name = file_path.name.lower()
        document_type = self._document_type_for(file_name)
        use_for = {
            "01_legal_core": ["tipificacion", "procedimiento"],
            "02_procedimiento_ieebc": ["procedimiento", "medidas_cautelares"],
            "03_violencia_digital_genero": ["tipificacion"],
            "04_atencion_victimas": ["victimas", "medidas_cautelares"],
            "05_privacidad_datos": ["privacidad"],
            "06_contexto_estadistico": ["contexto"],
        }.get(collection, [])
        institution = self._institution_for(file_name, collection)
        jurisdiction = self._jurisdiction_for(file_name, collection)
        return {
            "source_file": file_path.name,
            "collection": collection,
            "document_type": document_type,
            "jurisdiction": jurisdiction,
            "institution": institution,
            "priority": self._priority_for(collection, document_type),
            "page": page,
            "use_for": use_for,
        }

    def _document_type_for(self, file_name: str) -> str:
        if "demo" in file_name:
            return "demo"
        if "ley" in file_name:
            return "ley"
        if "reglamento" in file_name:
            return "reglamento"
        if "protocolo" in file_name:
            return "protocolo"
        if "criterio" in file_name or "criterios" in file_name:
            return "criterio"
        if "glosario" in file_name:
            return "glosario"
        if "estadistica" in file_name or "estadística" in file_name:
            return "estadistica"
        return "guia"

    def _institution_for(self, file_name: str, collection: str) -> str:
        if "ieebc" in file_name or collection == "02_procedimiento_ieebc":
            return "IEEBC"
        if "tepjf" in file_name:
            return "TEPJF"
        if "congreso" in file_name or "ley" in file_name:
            return "Congreso"
        if "voces-libres" in file_name:
            return "Voces Libres"
        return "No validado"

    def _jurisdiction_for(self, file_name: str, collection: str) -> str:
        if "_bc" in file_name or "baja-california" in file_name or collection == "02_procedimiento_ieebc":
            return "Baja California"
        return "Mexico"

    def _priority_for(self, collection: str, document_type: str) -> str:
        if document_type in {"ley", "reglamento", "protocolo", "criterio"}:
            return "high"
        if collection in {"01_legal_core", "02_procedimiento_ieebc", "03_violencia_digital_genero"}:
            return "medium"
        return "low"
