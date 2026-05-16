from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class SignalResult:
    signal_type: str
    label: str
    explanation: str
    weight: int
    matched: bool


class RiskRulesEngine:
    # Glosario controlado y revisable de lenguaje de género. Documentado, no inventado.
    GENDERED_TERMS: list[str] = [
        "mujer de la casa",
        "quédate en casa",
        "cocina",
        "solo es una mujer",
        "no sirve porque es mujer",
        "las mujeres no sirven",
        "feminazi",
        "puta",
        "zorra",
    ]

    def evaluate(self, text: str, metadata: dict[str, Any], prior_alerts_count: int = 0) -> list[SignalResult]:
        signals: list[SignalResult] = []
        signals.append(self._mention_match(text, metadata))
        signals.append(self._gendered_language(text))
        signals.append(self._burst_activity(metadata))
        signals.append(self._template_similarity(text, metadata))
        signals.append(self._high_reach_thread(metadata))
        signals.append(self._prior_alert_context(metadata, prior_alerts_count))
        return signals

    def compute_score(self, signals: list[SignalResult]) -> int:
        return sum(s.weight for s in signals if s.matched)

    @staticmethod
    def risk_level_from_score(score: int) -> str:
        if score == 0:
            return "unclassified"
        if score <= 34:
            return "low"
        if score <= 69:
            return "medium"
        return "high"

    def _mention_match(self, text: str, metadata: dict[str, Any]) -> SignalResult:
        protected_labels = metadata.get("protected_labels", [])
        matched = bool(protected_labels) and any(label.lower() in text.lower() for label in protected_labels)
        return SignalResult(
            signal_type="mention_match",
            label="Mencion protegida",
            explanation=f"El texto contiene referencia a etiqueta protegida: {protected_labels}." if matched else "Sin coincidencia de etiqueta protegida.",
            weight=20,
            matched=matched,
        )

    def _gendered_language(self, text: str) -> SignalResult:
        lower_text = text.lower()
        matched_terms = [term for term in self.GENDERED_TERMS if term in lower_text]
        matched = bool(matched_terms)
        return SignalResult(
            signal_type="gendered_language",
            label="Lenguaje de genero",
            explanation=f"Detectados terminos del glosario: {matched_terms}." if matched else "Sin terminos del glosario detectados.",
            weight=25,
            matched=matched,
        )

    def _burst_activity(self, metadata: dict[str, Any]) -> SignalResult:
        mentions_in_window = metadata.get("mentions_in_window", 0)
        matched = mentions_in_window >= 5
        return SignalResult(
            signal_type="burst_activity",
            label="Actividad en rafaga",
            explanation=f"{mentions_in_window} menciones en ventana corta." if matched else "Sin rafaga detectada.",
            weight=20,
            matched=matched,
        )

    def _template_similarity(self, text: str, metadata: dict[str, Any]) -> SignalResult:
        similar_count = metadata.get("similar_texts_count", 0)
        matched = similar_count >= 3
        return SignalResult(
            signal_type="template_similarity",
            label="Similitud de plantilla",
            explanation=f"{similar_count} textos con hash normalizado similar." if matched else "Sin similitudes repetidas detectadas.",
            weight=20,
            matched=matched,
        )

    def _high_reach_thread(self, metadata: dict[str, Any]) -> SignalResult:
        score = metadata.get("score", 0)
        matched = score is not None and score >= 50
        return SignalResult(
            signal_type="high_reach_thread",
            label="Hilo de alto alcance",
            explanation=f"Score {score} indica engagement alto." if matched else "Engagement dentro de rangos normales.",
            weight=10,
            matched=matched,
        )

    def _prior_alert_context(self, metadata: dict[str, Any], prior_alerts_count: int) -> SignalResult:
        matched = prior_alerts_count > 0
        return SignalResult(
            signal_type="prior_alert_context",
            label="Contexto de alerta previa",
            explanation=f"La fuente/termino aparece en {prior_alerts_count} alertas abiertas." if matched else "Sin alertas previas relacionadas.",
            weight=10,
            matched=matched,
        )
