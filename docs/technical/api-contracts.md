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

## Machiyotl MVP

Base path: `/api/v1/machiyotl`

Estos endpoints son contratos preliminares. El único endpoint backend de Machiyotl es de solo lectura. No existen endpoints de escritura (ver MCH-000).

### `GET /verify/{hash}`

Verifica públicamente si un hash SHA-256 de evidencia existe en el sistema. Endpoint de solo lectura. No requiere autenticación.

**Request:**

- `hash` (path parameter, string, max 128 chars): Hash SHA-256 en hexadecimal. Acepta prefijo opcional `sha256:`. Ejemplo: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`

**Response 200 — Hash existe:**

```json
{
  "result": "match",
  "evidence_id": "550e8400-e29b-41d4-a716-446655440000",
  "sealed_at": "2026-05-15T12:00:00Z",
  "short_hash": "e3b0c44298fc",
  "warning": "Verificación criptográfica de datos sintéticos. No constituye validez legal ni reemplaza la ratificación de autoridad competente."
}
```

**Response 200 — Hash no encontrado:**

```json
{
  "result": "evidence_not_found",
  "evidence_id": null,
  "sealed_at": null,
  "short_hash": null,
  "warning": "Verificación criptográfica de datos sintéticos. No constituye validez legal ni reemplaza la ratificación de autoridad competente."
}
```

**Response 400 — Hash inválido:**

```json
{
  "code": "invalid_hash",
  "message": "El hash proporcionado no tiene un formato hexadecimal válido."
}
```

**Reglas:**

- El endpoint NUNCA retorna contenido original (imagen, archivo, URL) de la evidencia.
- El disclaimer `warning` es obligatorio en toda respuesta 200.
- No se requiere autenticación (verificación pública).
- El campo `evidence_id` es opcional y solo se retorna si la evidencia está asociada a un expediente.
- Rate limiting: mínimo 10 req/min por IP.

**No-objetivos explícitos:**

- No hay endpoints POST/PUT/DELETE para Machiyotl.
- No se puede subir evidencia a través de esta API.
- No se retorna contenido de evidencia, solo metadatos.
- Este endpoint no reemplaza la validación de autoridad competente.
