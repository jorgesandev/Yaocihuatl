# Contratos de Integración Chimalli

Estos contratos son preliminares para el MVP. No representan contratos finales de producción.

## Entrada futura desde Tlachia

```json
{
  "tlachia_alert_id": "mock-alert-001",
  "source_platform": "X",
  "risk_level": "high",
  "narrative": "Texto autorizado o resumen mínimo",
  "detected_at": "2026-05-15T00:00:00Z",
  "explainability": ["Señal demo de descalificación por género"]
}
```

Reglas:

- No recibir scraping invasivo ni comunicaciones privadas.
- No tratar alertas como casos confirmados.
- No registrar datos personales innecesarios.

## Entrada futura desde Machiyotl

```json
{
  "case_id": "CHM-2026-0001",
  "evidence_status": "sealed_mock",
  "machiyotl_evidence_hashes": ["sha256:mocked-evidence-hash"],
  "custody_events": [
    {
      "step": "Evidencia sellada",
      "timestamp": "2026-05-15T00:00:00Z",
      "actor": "mvp-demo"
    }
  ]
}
```

Reglas:

- Chimalli solo referencia hashes y metadatos mínimos.
- No altera evidencia ni sustituye cadena de custodia.
- Un hash mock debe conservar etiqueta `sealed_mock`.

## Salida de Chimalli

```json
{
  "case_id": "CHM-2026-0001",
  "vpmrg_test": {
    "overall_result": "possible_vpmrg",
    "confidence": "medium"
  },
  "jurisdiction": {
    "suggested_authority": "IEEBC / UTCE",
    "procedure": "Procedimiento Especial Sancionador"
  },
  "rag_sources": [],
  "status": "draft",
  "human_review_notice": "Orientación preliminar generada por IA. Requiere revisión humana."
}
```

Reglas:

- No presentar denuncias automáticamente.
- No declarar culpabilidad.
- No hacer scoring de credibilidad.
- Incluir fuentes RAG cuando existan y advertir cuando no existan.
