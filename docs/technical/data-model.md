# Modelo de Datos

Cualquier modelo relacionado con evidencia, víctimas o expedientes deberá justificar minimización, retención, controles de acceso y auditoría.

## Chimalli MVP

Modelo preliminar en `backend/app/schemas/chimalli.py`.

```json
{
  "case_id": "CHM-2026-0001",
  "victim": {
    "name": null,
    "role": "candidata",
    "position": "regiduría",
    "jurisdiction": "local",
    "state": "Baja California",
    "municipality": "Mexicali"
  },
  "facts": {
    "platform": "X",
    "dates": [],
    "aggressors": [],
    "narrative": "",
    "evidence": []
  },
  "vpmrg_test": {
    "political_electoral_link": { "meets": true, "reason": "" },
    "gender_element": { "meets": true, "reason": "" },
    "political_rights_impact": { "meets": true, "reason": "" },
    "overall_result": "possible_vpmrg",
    "confidence": "medium"
  },
  "jurisdiction": {
    "suggested_authority": "IEEBC / UTCE",
    "procedure": "Procedimiento Especial Sancionador",
    "alternative_routes": []
  },
  "rag_sources": [],
  "status": "draft"
}
```

## Persistencia

El MVP inicial de Chimalli usa memoria de proceso para casos y JSONL local para índice RAG. La plataforma ahora incluye una fundación persistente en PostgreSQL para que los módulos migren gradualmente a APIs reales sin perder separación de responsabilidades.

## Fundación PostgreSQL

Esquemas:

- `iam`: organizaciones, roles, usuarios demo, sesiones, consentimientos y preferencias.
- `core`: expedientes transversales, asignaciones y cambios de estado.
- `tlachia`: alertas, señales explicables, menciones sanitizadas y clusters.
- `machiyotl`: evidencias, referencias a archivos locales, hashes, notas y cadena de custodia.
- `chimalli`: tablas futuras para casos, mensajes, extracciones, test asistivo, rutas, fuentes RAG y logs LLM.
- `observatory`: métricas públicas agregadas con umbral de anonimización.
- `audit`: bitácora auditable de accesos, cambios y seeds.

La evidencia demo se guarda como archivo local sintético referenciado por metadatos. En producción, el almacenamiento deberá sustituirse por un mecanismo institucional aprobado, cifrado y con retención configurable.

El badge “Demo” en frontend no significa mock-only: significa datos sintéticos, credenciales públicas, acciones reversibles/simuladas y revisión humana obligatoria. La base, migraciones, auth y APIs sí son reales para despliegue de prueba.
