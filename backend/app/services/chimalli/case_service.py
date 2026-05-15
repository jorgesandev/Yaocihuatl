from __future__ import annotations

from datetime import datetime
import html
from typing import Dict, List
from uuid import uuid4

from app.schemas.chimalli import (
    CaseFacts,
    ChimalliCase,
    ChimalliCaseInput,
    EvidenceReference,
    ExpedienteHtml,
    ExtractResponse,
    JurisdictionSuggestion,
    MockIntegrationInput,
    TestElementResult,
    VictimProfile,
    VpmrgTestResult,
)
from app.services.chimalli.chunking import join_non_empty
from app.services.chimalli.rag_service import RagService


HUMAN_REVIEW_NOTICE = (
    "Orientación preliminar generada por IA. Requiere revisión humana y validación de autoridad competente; "
    "no sustituye asesoría legal ni constituye resolución."
)


class CaseNotFoundError(ValueError):
    pass


class ChimalliCaseService:
    def __init__(self, rag_service: RagService | None = None) -> None:
        self.rag_service = rag_service or RagService()
        self._cases: Dict[str, ChimalliCase] = {}

    def create_case(self, case_input: ChimalliCaseInput) -> ChimalliCase:
        extraction = self.extract(case_input.narrative, case_input.integration)
        victim = self._merge_victim(extraction.victim, case_input.victim)
        facts = extraction.facts
        vpmrg_test = self.evaluate_vpmrg(case_input.narrative, victim)
        jurisdiction = self.suggest_jurisdiction(case_input.narrative, victim)
        rag_sources = self.rag_service.search(
            query=join_non_empty([case_input.narrative, vpmrg_test.overall_result, jurisdiction.procedure]),
            intent="tipificacion",
            limit=5,
        ).sources
        case = ChimalliCase(
            case_id=self._next_case_id(),
            victim=victim,
            facts=facts,
            vpmrg_test=vpmrg_test,
            jurisdiction=jurisdiction,
            rag_sources=rag_sources,
            integration=case_input.integration,
            status="draft",
            created_at=datetime.utcnow(),
            human_review_notice=HUMAN_REVIEW_NOTICE,
        )
        self._cases[case.case_id] = case
        return case

    def get_case(self, case_id: str) -> ChimalliCase:
        case = self._cases.get(case_id)
        if case is None:
            raise CaseNotFoundError("No existe el caso Chimalli solicitado.")
        return case

    def extract(self, narrative: str, integration: MockIntegrationInput | None = None) -> ExtractResponse:
        lower = narrative.lower()
        victim = VictimProfile(
            role=self._first_match(lower, ["candidata", "precandidata", "funcionaria electa", "consejera", "magistrada", "dirigente partidista"]),
            position="regiduría" if "regidor" in lower or "regidora" in lower else None,
            jurisdiction="local" if "baja california" in lower or "mexicali" in lower else None,
            state="Baja California" if "baja california" in lower else None,
            municipality="Mexicali" if "mexicali" in lower else None,
        )
        platform = integration.source_platform if integration else self._first_match(narrative, ["X", "Facebook", "Instagram", "TikTok", "YouTube"])
        evidence: List[EvidenceReference] = []
        if integration:
            evidence = [
                EvidenceReference(
                    evidence_id=integration.tlachia_alert_id,
                    source_platform=integration.source_platform,
                    evidence_hash=evidence_hash,
                    status=integration.evidence_status,
                )
                for evidence_hash in integration.machiyotl_evidence_hashes
            ]
        facts = CaseFacts(
            platform=platform,
            dates=["ayer"] if "ayer" in lower else [],
            aggressors=["varias cuentas"] if "varias cuentas" in lower else [],
            narrative=narrative,
            evidence=evidence,
        )
        return ExtractResponse(
            victim=victim,
            facts=facts,
            warning="Extraccion asistiva basada solo en la narrativa proporcionada; no completa datos por inferencia externa.",
        )

    def evaluate_vpmrg(self, narrative: str, victim: VictimProfile | None = None) -> VpmrgTestResult:
        lower = narrative.lower()
        political_terms = ["candidata", "precandidata", "funcionaria", "electa", "consejera", "magistrada", "dirigente", "campaña", "elección"]
        gender_terms = ["mujer", "quedarse en casa", "quedarme en mi casa", "capacidad", "vergüenza", "verguenza", "imágenes editadas", "imagenes editadas"]
        impact_terms = ["afecte mi participación", "participación", "derechos", "seguridad", "elección", "campaña"]

        political = bool(victim and victim.role) or self._contains_any(lower, political_terms)
        gender = self._contains_any(lower, gender_terms)
        impact = self._contains_any(lower, impact_terms)
        overall = "possible_vpmrg" if political and gender and impact else "insufficient_information"
        confidence = "medium" if overall == "possible_vpmrg" else "low"
        return VpmrgTestResult(
            political_electoral_link=TestElementResult(
                meets=political,
                reason="La narrativa declara rol o contexto politico-electoral." if political else "Falta declarar rol o contexto politico-electoral.",
            ),
            gender_element=TestElementResult(
                meets=gender,
                reason="Se observan expresiones vinculadas con estereotipos o descalificacion por ser mujer." if gender else "No se identifican expresiones de genero suficientes en la narrativa.",
            ),
            political_rights_impact=TestElementResult(
                meets=impact,
                reason="La narrativa refiere posible afectacion a participacion politico-electoral o seguridad." if impact else "Falta describir posible afectacion a derechos politico-electorales.",
            ),
            overall_result=overall,
            confidence=confidence,
        )

    def suggest_jurisdiction(self, narrative: str, victim: VictimProfile | None = None) -> JurisdictionSuggestion:
        lower = narrative.lower()
        is_baja_california = bool(victim and victim.state == "Baja California") or "baja california" in lower or "mexicali" in lower
        if is_baja_california:
            return JurisdictionSuggestion(
                suggested_authority="IEEBC / UTCE",
                procedure="Procedimiento Especial Sancionador",
                alternative_routes=["Orientacion institucional", "Medidas de atencion o seguridad segun revision humana"],
                reason="Sugerencia preliminar por contexto local declarado en Baja California; debe validarse por autoridad competente.",
            )
        return JurisdictionSuggestion(
            suggested_authority="Autoridad electoral competente por validar",
            procedure="Ruta por determinar",
            alternative_routes=["Solicitar orientacion institucional"],
            reason="No hay datos suficientes para sugerir una autoridad especifica sin validacion humana.",
        )

    def generate_expediente_html(self, case_id: str) -> ExpedienteHtml:
        case = self.get_case(case_id)
        source_items = "".join(
            "<li>" + html.escape(source.source_file) + " - " + html.escape(source.collection) + "</li>"
            for source in case.rag_sources
        ) or "<li>No hay fuentes RAG recuperadas. No inventar citas.</li>"
        evidence_items = "".join(
            "<li>" + html.escape(evidence.evidence_hash or "Referencia sin hash") + " - " + html.escape(evidence.status) + "</li>"
            for evidence in case.facts.evidence
        ) or "<li>Sin evidencia sellada asociada en este borrador.</li>"
        document = f"""
        <!doctype html>
        <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Chimalli - Borrador para revision humana</title>
          <style>
            body {{ font-family: Arial, sans-serif; color: #1E1A23; line-height: 1.5; margin: 32px; }}
            h1, h2 {{ color: #421557; }}
            .notice {{ border: 1px solid #C9C2CE; background: #F7EAF8; border-radius: 12px; padding: 16px; }}
            .meta {{ font-family: monospace; font-size: 13px; }}
          </style>
        </head>
        <body>
          <h1>Borrador para revisión humana</h1>
          <p class="notice">No constituye denuncia automática. {html.escape(case.human_review_notice)}</p>
          <h2>Identificacion del caso</h2>
          <p class="meta">{html.escape(case.case_id)}</p>
          <h2>Resumen asistivo</h2>
          <p>Resultado preliminar: {html.escape(case.vpmrg_test.overall_result)}</p>
          <p>Autoridad sugerida: {html.escape(case.jurisdiction.suggested_authority)}</p>
          <p>Via sugerida: {html.escape(case.jurisdiction.procedure)}</p>
          <h2>Test VPMRG asistivo</h2>
          <ul>
            <li>Vinculo politico-electoral: {case.vpmrg_test.political_electoral_link.meets} - {html.escape(case.vpmrg_test.political_electoral_link.reason)}</li>
            <li>Elemento de genero: {case.vpmrg_test.gender_element.meets} - {html.escape(case.vpmrg_test.gender_element.reason)}</li>
            <li>Afectacion a derechos politico-electorales: {case.vpmrg_test.political_rights_impact.meets} - {html.escape(case.vpmrg_test.political_rights_impact.reason)}</li>
          </ul>
          <h2>Evidencia referenciada</h2>
          <ul>{evidence_items}</ul>
          <h2>Fuentes RAG</h2>
          <ul>{source_items}</ul>
          <h2>Narrativa autorizada</h2>
          <p>{html.escape(case.facts.narrative)}</p>
        </body>
        </html>
        """
        return ExpedienteHtml(
            case_id=case.case_id,
            html=document,
            warnings=[
                "Borrador para revision humana; no constituye denuncia automatica.",
                "Las fuentes RAG dependen del corpus local indexado.",
            ],
        )

    def _next_case_id(self) -> str:
        return "CHM-" + datetime.utcnow().strftime("%Y") + "-" + uuid4().hex[:8].upper()

    def _merge_victim(self, extracted: VictimProfile, provided: VictimProfile | None) -> VictimProfile:
        if provided is None:
            return extracted
        data = extracted.model_dump()
        for key, value in provided.model_dump().items():
            if value is not None:
                data[key] = value
        return VictimProfile.model_validate(data)

    def _contains_any(self, text: str, terms: List[str]) -> bool:
        return any(term in text for term in terms)

    def _first_match(self, text: str, terms: List[str]) -> str | None:
        lower = text.lower()
        for term in terms:
            if term.lower() in lower:
                return term
        return None
