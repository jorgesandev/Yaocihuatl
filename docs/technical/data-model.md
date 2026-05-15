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

El MVP usa memoria de proceso para casos y JSONL local para índice RAG. Esto no es apto para producción.

Producción requiere:

- PostgreSQL o almacenamiento institucional aprobado.
- pgvector o vector store con controles de acceso.
- Cifrado en reposo y tránsito.
- Auditoría.
- Retención configurable.
- Separación estricta entre demo, sintético, anonimizado y real.
