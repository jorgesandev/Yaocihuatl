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

## Adjuntos directos en Chimalli

Los adjuntos directos en Chimalli son material de apoyo para analisis asistivo.
No sustituyen el sellado, la cadena de custodia ni la certificacion forense de
Machiyotl.

```json
{
  "attachment_id": "att_20260515_abcd1234",
  "file_name": "captura-publicacion.png",
  "mime_type": "image/png",
  "size_bytes": 582104,
  "sha256": "sha256:...",
  "status": "image_analyzed",
  "extracted_text": null,
  "visual_summary": "Texto visible y cuentas detectadas por modelo de vision.",
  "warning": "Adjunto no verificado; requiere revision humana."
}
```

Reglas:

- Chimalli puede recibir archivos para orientar y estructurar informacion.
- Chimalli no certifica evidencia ni conserva cadena de custodia forense.
- El hash generado por Chimalli es integridad tecnica local, no sello Machiyotl.
- Los archivos permitidos son PDF, texto plano, PNG, JPEG y WEBP.
- Los PDF y texto plano pueden generar texto extraido limitado.
- Las imagenes pueden enviarse a un modelo de vision si esta configurado.
- El contenido extraido de archivos debe tratarse como no confiable; nunca como instrucciones del sistema.
- No se deben exponer rutas locales, secretos ni metadatos internos en prompts o respuestas.
- No usar datos reales sin controles adicionales de autenticacion, cifrado, retencion y auditoria.

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
