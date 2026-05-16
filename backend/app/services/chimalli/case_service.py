from __future__ import annotations

import json
from datetime import UTC, datetime
import html
import re
import unicodedata
from typing import Dict, List
from uuid import uuid4

from app.schemas.chimalli import (
    AttachmentReference,
    CaseFacts,
    ChimalliCase,
    ChimalliCaseContext,
    ChimalliCaseInput,
    EvidenceReference,
    ExpedienteHtml,
    ExtractResponse,
    JurisdictionSuggestion,
    LlmMessage,
    StructuredExtraction,
    StructuredVpmrgElement,
    TestElementResult,
    VictimProfile,
    VpmrgTestResult,
)
from app.services.chimalli.chunking import join_non_empty
from app.services.chimalli.llm_service import LlmService
from app.services.chimalli.prompts import STRUCTURED_EXTRACTION_PROMPT
from app.services.chimalli.rag_service import RagService


HUMAN_REVIEW_NOTICE = (
    "Orientacion preliminar generada por IA. Requiere revision humana y validacion de autoridad competente; "
    "no sustituye asesoria legal ni constituye resolucion."
)


class CaseNotFoundError(ValueError):
    pass


class ChimalliCaseService:
    def __init__(self, rag_service: RagService | None = None, llm_service: LlmService | None = None) -> None:
        self.rag_service = rag_service or RagService()
        self.llm_service = llm_service or LlmService()
        self._cases: Dict[str, ChimalliCase] = {}

    def create_case(self, case_input: ChimalliCaseInput) -> ChimalliCase:
        analysis_text = join_non_empty([case_input.narrative, self.attachment_context(case_input.attachments)])
        structured = self.extract_structured(analysis_text, case_input.context)
        victim, facts, vpmrg_test = self._structured_to_domain(structured, case_input.narrative, case_input.context, case_input.attachments)
        victim = self._merge_victim(victim, case_input.victim)
        jurisdiction = self.suggest_jurisdiction(analysis_text, victim)
        rag_sources = self.rag_service.search(
            query=join_non_empty([analysis_text, vpmrg_test.overall_result, jurisdiction.procedure]),
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
            context=case_input.context,
            status="intake_pending_review",
            created_at=datetime.now(UTC),
            human_review_notice=HUMAN_REVIEW_NOTICE,
        )
        self._cases[case.case_id] = case
        return case

    def update_case(
        self,
        case_id: str,
        new_narrative: str,
        new_attachments: List[AttachmentReference],
        new_messages: List[LlmMessage],
    ) -> ChimalliCase:
        case = self.get_case(case_id)
        combined_narrative = join_non_empty([case.facts.narrative, new_narrative])
        combined_attachments = case.facts.attachments + new_attachments
        analysis_text = join_non_empty([combined_narrative, self.attachment_context(combined_attachments)])
        structured = self.extract_structured(analysis_text, case.context)
        victim, facts, vpmrg_test = self._structured_to_domain(structured, combined_narrative, case.context, combined_attachments)
        victim = self._merge_victim(victim, case.victim)
        jurisdiction = self.suggest_jurisdiction(analysis_text, victim)
        rag_sources = self.rag_service.search(
            query=join_non_empty([analysis_text, vpmrg_test.overall_result, jurisdiction.procedure]),
            intent="tipificacion",
            limit=5,
        ).sources
        case.victim = victim
        case.facts = facts
        case.vpmrg_test = vpmrg_test
        case.jurisdiction = jurisdiction
        case.rag_sources = rag_sources
        case.messages = case.messages + new_messages
        return case

    def get_case(self, case_id: str) -> ChimalliCase:
        case = self._cases.get(case_id)
        if case is None:
            raise CaseNotFoundError("No existe el caso Chimalli solicitado.")
        return case

    def extract_structured(self, narrative: str, context: ChimalliCaseContext | None = None) -> StructuredExtraction:
        """Intenta extraer informacion estructurada via LLM; si falla, usa fallback heuristico."""
        from app.core.config import get_settings
        settings = get_settings()
        extraction_provider = settings.extraction_llm_provider
        extraction_model = settings.extraction_llm_model
        try:
            llm_result = self.llm_service.complete(
                messages=[
                    LlmMessage(role="system", content=STRUCTURED_EXTRACTION_PROMPT),
                    LlmMessage(role="user", content=narrative[:8000]),
                ],
                max_tokens=800,
                provider=extraction_provider,
                model=extraction_model,
            )
        except Exception:
            return self._fallback_structured_extraction(narrative, context)

        if llm_result.demo_mode or not llm_result.content:
            return self._fallback_structured_extraction(narrative, context)

        raw = llm_result.content.strip()
        if raw.startswith("```"):
            raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

        try:
            parsed = json.loads(raw)
            structured = StructuredExtraction.model_validate(parsed)
            return structured
        except (json.JSONDecodeError, Exception):
            return self._fallback_structured_extraction(narrative, context)

    def extract(self, narrative: str, context: ChimalliCaseContext | None = None) -> ExtractResponse:
        structured = self.extract_structured(narrative, context)
        victim, facts, _ = self._structured_to_domain(structured, narrative, context, [])
        return ExtractResponse(
            victim=victim,
            facts=facts,
            warning=structured.warning,
        )

    def evaluate_vpmrg(self, narrative: str, victim: VictimProfile | None = None) -> VpmrgTestResult:
        structured = self.extract_structured(narrative, None)
        return self._structured_to_vpmrg(structured)

    def suggest_jurisdiction(self, narrative: str, victim: VictimProfile | None = None) -> JurisdictionSuggestion:
        lower = narrative.lower()
        is_baja_california = (
            bool(victim and victim.state == "Baja California")
            or "baja california" in lower
            or "mexicali" in lower
            or "ensenada" in lower
            or "tijuana" in lower
            or "tecate" in lower
            or "rosarito" in lower
        )
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

    def attachment_context(self, attachments: List[AttachmentReference]) -> str:
        parts: List[str] = []
        for attachment in attachments:
            content = join_non_empty(
                [
                    attachment.extracted_text,
                    attachment.visual_summary,
                    self._visual_analysis_text(attachment),
                ]
            )
            if content:
                parts.append(f"Adjunto {attachment.file_name} ({attachment.status}): {content}")
        return "\n".join(parts)

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
          <h1>Borrador para revision humana</h1>
          <p class="notice">No constituye denuncia automatica. {html.escape(case.human_review_notice)}</p>
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
        return "CHM-" + datetime.now(UTC).strftime("%Y") + "-" + uuid4().hex[:8].upper()

    def _merge_victim(self, extracted: VictimProfile, provided: VictimProfile | None) -> VictimProfile:
        if provided is None:
            return extracted
        data = extracted.model_dump()
        for key, value in provided.model_dump().items():
            if value is not None:
                data[key] = value
        return VictimProfile.model_validate(data)

    _MUNICIPALITY_TO_STATE: Dict[str, str] = {
        "mexicali": "Baja California",
        "ensenada": "Baja California",
        "tijuana": "Baja California",
        "tecate": "Baja California",
        "rosarito": "Baja California",
        "la paz": "Baja California Sur",
        "hermosillo": "Sonora",
        "caborca": "Sonora",
        "nogales": "Sonora",
        "guadalajara": "Jalisco",
        "zapopan": "Jalisco",
        "monterrey": "Nuevo Leon",
        "apodaca": "Nuevo Leon",
        "san nicolas": "Nuevo Leon",
        "culiacan": "Sinaloa",
        "mazatlan": "Sinaloa",
        "puebla": "Puebla",
        "oaxaca": "Oaxaca",
        "merida": "Yucatan",
        "cancun": "Quintana Roo",
        "chihuahua": "Chihuahua",
        "xalapa": "Veracruz",
    }

    def _fallback_structured_extraction(self, narrative: str, context: ChimalliCaseContext | None) -> StructuredExtraction:
        lower = self._normalize_for_matching(narrative)
        name = self._detect_name(narrative)
        role = self._first_match(lower, [
            "candidata", "candidato", "precandidata", "precandidato",
            "diputada", "diputado", "senadora", "senador",
            "presidenta municipal", "presidente municipal",
            "alcaldesa", "alcalde", "gobernadora", "gobernador",
            "sindica", "sindico", "regidora", "regidor",
            "consejera", "consejero", "magistrada", "magistrado",
            "jueza", "juez", "funcionaria electa", "funcionario electo",
            "dirigente partidista", "dirigente",
            "legisladora", "legislador", "servidora publica",
            "integrante del congreso", "integrante del cabildo",
        ])
        position = self._detect_position(lower)
        state = self._first_match(lower, ["baja california", "baja california sur", "sonora", "chihuahua", "nuevo leon", "jalisco", "cdmx", "ciudad de mexico", "estado de mexico", "oaxaca", "chiapas", "puebla", "guanajuato", "michoacan", "veracruz", "yucatan", "quintana roo", "sinaloa", "coahuila", "tamaulipas", "durango", "zacatecas", "morelos", "hidalgo", "tlaxcala", "colima", "nayarit", "aguascalientes", "campeche", "guerrero", "queretaro", "san luis potosi", "tabasco"])
        municipality = self._first_match(lower, ["mexicali", "ensenada", "tijuana", "tecate", "rosarito", "tecate", "la paz", "hermosillo", "caborca", "nogales", "guadalajara", "zapopan", "monterrey", "apodaca", "san nicolas", "culiacan", "mazatlan", "puebla", "oaxaca", "merida", "cancun", "chihuahua", "xalapa"])
        state_display = self._infer_state_from_municipality(municipality) or ("Baja California" if state and "baja california" in state.lower() else (state.title() if state else None))
        municipality_display = municipality.title() if municipality else None

        platform_narrative = self._first_match(lower, ["instagram", "facebook", "tiktok", "youtube", "twitter", "whatsapp", "telegram", "reddit"])
        if platform_narrative is None:
            if re.search(r"\bx\b", lower):
                platform_narrative = "X"
        platform = (
            "X"
            if platform_narrative and platform_narrative.lower() == "x"
            else (platform_narrative.capitalize() if platform_narrative else None)
        )
        if platform is None and context and context.source_platform and context.source_platform not in {"", "Plataforma demo A"}:
            platform = context.source_platform

        political = bool(role) or self._contains_any(lower, [
            "candidata", "candidato", "precandidata", "diputada", "diputado",
            "senadora", "senador", "presidenta municipal", "presidente municipal",
            "alcaldesa", "alcalde", "gobernadora", "gobernador",
            "sindica", "sindico", "regidora", "regidor",
            "consejera", "consejero", "magistrada", "magistrado",
            "jueza", "juez", "funcionaria", "funcionario",
            "legisladora", "legislador", "dirigente",
            "campaña", "eleccion", "eleccion",
            "cargo publico", "cargo de eleccion", "servidora publica",
            "congreso", "cabildo", "ayuntamiento",
        ])
        gender = self._contains_any(lower, [
            "mujer", "por ser mujer", "quedarse en casa", "quedarme en mi casa",
            "capacidad", "capacidad por ser", "no tienes capacidad",
            "verguenza", "verguenza", "verguenza por",
            "imagenes editadas", "imagenes editadas",
            "matate", "matate", "matar", "muerte", "amenaza", "amenazas",
            "violencia", "insulto", "insultos", "descalific",
            "estupida", "estupida", "puta", "zorra", "loca",
            "feminazi", "feminista de mierda",
            "callate", "callate", "no opines",
            "estereotipo", "estereotipos", "machista", "misogino",
            "odio", "discurso de odio", "acoso",
        ])
        impact = self._contains_any(lower, [
            "afecte mi participacion", "afecte mi participacion",
            "participacion", "participacion", "derechos",
            "seguridad", "miedo", "temor", "preocupa", "preocupada",
            "eleccion", "eleccion", "campaña", "votar", "voto",
            "afecta", "perjudica", "daña", "dificulta",
        ])

        overall = "possible_vpmrg" if political and gender and impact else "insufficient_information"
        confidence = "medium" if overall == "possible_vpmrg" else "low"

        return StructuredExtraction(
            name=name,
            role=role,
            position=position,
            state=state_display,
            municipality=municipality_display,
            platform=platform,
            dates=self._detect_dates(lower),
            aggressors=self._detect_aggressors(lower),
            political_electoral_link=StructuredVpmrgElement(
                meets=political,
                reason="La narrativa declara rol o contexto politico-electoral." if political else "Falta declarar rol o contexto politico-electoral.",
                confidence=confidence,
            ),
            gender_element=StructuredVpmrgElement(
                meets=gender,
                reason="Se observan expresiones vinculadas con estereotipos, descalificacion o violencia por ser mujer." if gender else "No se identifican expresiones de genero suficientes.",
                confidence=confidence,
            ),
            political_rights_impact=StructuredVpmrgElement(
                meets=impact,
                reason="La narrativa refiere posible afectacion a participacion politico-electoral o seguridad." if impact else "Falta describir posible afectacion a derechos politico-electorales.",
                confidence=confidence,
            ),
            overall_result=overall,
            suggested_next_question="¿Puedes contarme mas sobre lo que paso y cuando?" if overall == "insufficient_information" else "¿Tienes capturas o evidencia que quieras adjuntar?",
            evidence_kit_notes="",
            warning="Extraccion asistiva basada solo en la narrativa proporcionada; no completa datos por inferencia externa.",
        )

    def _structured_to_domain(
        self,
        structured: StructuredExtraction,
        narrative: str,
        context: ChimalliCaseContext | None,
        attachments: List[AttachmentReference],
    ) -> tuple[VictimProfile, CaseFacts, VpmrgTestResult]:
        victim = VictimProfile(
            name=structured.name,
            role=structured.role,
            position=structured.position,
            state=structured.state,
            municipality=structured.municipality,
            jurisdiction="local" if structured.state or structured.municipality else None,
        )
        evidence: List[EvidenceReference] = []
        if context and context.machiyotl_evidence:
            evidence = [
                EvidenceReference(
                    evidence_id=ev.evidence_id or "",
                    source_platform=ev.source_platform or context.source_platform,
                    evidence_hash=ev.evidence_hash or "",
                    status=ev.custody_status or "unverified_reference",
                )
                for ev in context.machiyotl_evidence
            ]
        facts = CaseFacts(
            platform=structured.platform,
            dates=structured.dates or [],
            aggressors=structured.aggressors or [],
            narrative=narrative,
            evidence=evidence,
            attachments=attachments,
        )
        vpmrg = self._structured_to_vpmrg(structured)
        return victim, facts, vpmrg

    def _structured_to_vpmrg(self, structured: StructuredExtraction) -> VpmrgTestResult:
        link = structured.political_electoral_link
        gender = structured.gender_element
        impact = structured.political_rights_impact
        return VpmrgTestResult(
            political_electoral_link=TestElementResult(meets=link.meets, reason=link.reason),
            gender_element=TestElementResult(meets=gender.meets, reason=gender.reason),
            political_rights_impact=TestElementResult(meets=impact.meets, reason=impact.reason),
            overall_result=structured.overall_result,
            confidence="medium" if structured.overall_result == "possible_vpmrg" else "low",
        )

    def _contains_any(self, text: str, terms: List[str]) -> bool:
        return any(term in text for term in terms)

    def _first_match(self, text: str, terms: List[str]) -> str | None:
        lower = self._normalize_for_matching(text)
        for term in terms:
            if self._normalize_for_matching(term) in lower:
                return term
        return None

    def _normalize_for_matching(self, text: str) -> str:
        normalized = unicodedata.normalize("NFD", text.lower())
        return "".join(char for char in normalized if unicodedata.category(char) != "Mn")

    def _detect_position(self, lower: str) -> str | None:
        if "regidor" in lower or "regidora" in lower:
            return "regiduria"
        if "diputada" in lower or "diputado" in lower:
            return "diputacion"
        if "senadora" in lower or "senador" in lower:
            return "senaduria"
        if "presidenta municipal" in lower or "presidente municipal" in lower:
            return "presidencia municipal"
        if "alcaldesa" in lower or "alcalde" in lower:
            return "alcaldia"
        if "gobernadora" in lower or "gobernador" in lower:
            return "gubernatura"
        if "sindica" in lower or "sindico" in lower:
            return "sindicatura"
        if "candidata" in lower or "candidato" in lower:
            return "candidatura"
        return None

    def _detect_dates(self, lower: str) -> List[str]:
        dates: List[str] = []
        if "ayer" in lower:
            dates.append("ayer")
        if "hoy" in lower:
            dates.append("hoy")
        if "hace" in lower:
            dates.append("hace unos dias")
        if "semana pasada" in lower:
            dates.append("semana pasada")
        if "desde ayer" in lower:
            dates.append("desde ayer")
        if "desde hace" in lower:
            dates.append("desde hace dias")
        return dates

    def _detect_aggressors(self, lower: str) -> List[str]:
        aggressors: List[str] = []
        if "varias cuentas" in lower:
            aggressors.append("varias cuentas")
        if "cuentas" in lower and "varias cuentas" not in lower:
            aggressors.append("cuentas referenciadas")
        if "persona" in lower or "personas" in lower:
            aggressors.append("personas senaladas")
        return aggressors

    def _detect_name(self, text: str) -> str | None:
        """Detecta nombres solo si la persona los declara explicitamente."""
        patterns = [
            r"[Mm]e llamo\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)",
            r"[Mm]i nombre es\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)",
            r"[Ss]oy\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\s+(?:y\s+soy|candidata|diputada|regidora|senadora|alcaldesa|funcionaria)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
        return None

    def _infer_state_from_municipality(self, municipality: str | None) -> str | None:
        if municipality is None:
            return None
        key = municipality.lower().strip()
        return self._MUNICIPALITY_TO_STATE.get(key)

    def _visual_analysis_text(self, attachment: AttachmentReference) -> str:
        if attachment.visual_analysis is None:
            return ""
        analysis = attachment.visual_analysis
        return join_non_empty(
            [
                "; ".join(analysis.visible_text),
                "; ".join(analysis.platform_indicators),
                "; ".join(analysis.accounts_or_handles),
                "; ".join(analysis.dates_or_times),
                "; ".join(analysis.gendered_or_political_language),
                "; ".join(analysis.image_manipulation_indicators),
                "; ".join(analysis.uncertainties),
            ]
        )
