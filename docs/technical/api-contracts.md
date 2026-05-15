# Contratos API

Los contratos deberán versionarse, documentar permisos, errores, auditoría y límites de datos.

## Chimalli MVP

Base path: `/api/v1/chimalli`

Estos endpoints son contratos preliminares para hackathón. No son contratos finales de producción.

### `POST /chat`

Entrada:

```json
{
  "message": "Narrativa sintética o autorizada",
  "case_id": null,
  "integration": {
    "tlachia_alert_id": "mock-alert-001",
    "source_platform": "X",
    "risk_level": "high",
    "machiyotl_evidence_hashes": ["sha256:mocked-evidence-hash"],
    "evidence_status": "sealed_mock"
  }
}
```

Salida: caso Chimalli estructurado, respuesta asistiva y respuestas rápidas.

### `POST /extract`

Extrae entidades explícitas desde narrativa. No completa datos faltantes por inferencia externa.

### `POST /vpmrg-test`

Aplica test asistivo de tres elementos. No es decisión jurídica.

### `POST /jurisdiction`

Sugiere ruta preliminar de canalización. Requiere validación humana.

### `POST /expediente`

Genera HTML imprimible como borrador para revisión humana. No constituye denuncia automática.

### `GET /cases/{case_id}`

Consulta caso en memoria del proceso actual. No es persistencia productiva.

### `POST /rag/index`

Indexa documentos disponibles en `rag_documents/` o ruta indicada.

### `POST /rag/search`

Busca chunks por intención y colección.

Intenciones soportadas:

- `tipificacion`
- `procedimiento`
- `canalizacion`
- `medidas`
- `seguridad`
- `privacidad`
- `contexto`

## Seguridad Pendiente Para Producción

- Auth/RBAC.
- Auditoría de accesos y cambios.
- Persistencia cifrada.
- Retención configurable.
- Rate limiting.
- Revisión de corpus legal versionado.
