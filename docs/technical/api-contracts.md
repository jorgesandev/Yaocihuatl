# Contratos API

Base path: `/api/v1`

Todos los contratos son versionados y deben documentar permisos, errores, auditoria, limites de datos y estado de implementacion. La API actual es real para despliegue y pruebas con datos sinteticos; no es todavia un contrato final para datos sensibles.

## Auth

### `POST /auth/login`

Estado: implementado.

Entrada:

```json
{
  "username": "analista",
  "password": "electoral"
}
```

Salida:

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_at": "2026-05-15T00:00:00Z",
  "user": {
    "id": "...",
    "username": "analista",
    "display_name": "Analista electoral demo",
    "roles": [
      {
        "code": "electoral_analyst",
        "label": "Autoridad electoral / Analista"
      }
    ]
  }
}
```

Auditoria:

- login exitoso registra sesion;
- login fallido registra evento `auth.login` con `outcome=failure`.

Implementado:

- `POST /auth/logout` revoca sesion y audita.
- `POST /auth/change-password` exige contrasena actual y token valido.

Pendiente:

- politicas institucionales de contrasena (longitud, complejidad, historial);
- recuperacion/rotacion;
- RBAC por recurso;
- SSO o proveedor institucional (objetivo futuro fase 2).

### `GET /auth/me`

Estado: implementado.

Requiere `Authorization: Bearer <token>`.

Devuelve el usuario actual y sus roles.

## Users

Base path: `/api/v1/users`

Estado: implementado MVP. Requiere rol `admin`.

Endpoints:

- `GET /users` — listar usuarios.
- `POST /users` — crear usuario.
- `GET /users/{id}` — consultar usuario.
- `PATCH /users/{id}` — actualizar usuario.
- `POST /users/{id}/disable` — desactivar usuario.
- `POST /users/{id}/roles` — asignar roles.
- `DELETE /users/{id}/roles/{role_code}` — remover rol.

Auditoria: cada accion escribe en `audit.audit_log`.

## Chimalli

Base path: `/api/v1/chimalli`

Chimalli es asistencia preliminar. Ningun endpoint presenta denuncias automaticamente, confirma VPMRG ni sustituye asesoria legal o resolucion de autoridad.

### `POST /attachments`

Estado: implementado MVP.

Permite adjuntar archivos asistivos (PDF, imagen, texto) para que Chimalli los considere en su contexto conversacional. No constituye sellado forense (eso corresponde a Machiyotl).

**Entrada:** `multipart/form-data` con campo `file`.

**Tipos permitidos:** `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.txt`, `.md`.

**Límites:** máximo 10 MB por archivo y 5 adjuntos por mensaje de chat.

**Salida:**

```json
{
  "attachment": {
    "attachment_id": "att_...",
    "file_name": "captura.png",
    "mime_type": "image/png",
    "size_bytes": 12345,
    "sha256": "sha256:...",
    "status": "image_analyzed",
    "extracted_text": null,
    "visual_analysis": {
      "visible_text": ["texto visible"],
      "platform_indicators": ["X"],
      "accounts_or_handles": ["@cuenta"],
      "dates_or_times": [],
      "gendered_or_political_language": ["por ser mujer"],
      "image_manipulation_indicators": [],
      "uncertainties": [],
      "summary_for_case": "Resumen asistivo"
    },
    "visual_summary": "Resumen asistivo",
    "warning": "Adjunto no verificado; requiere revision humana."
  }
}
```

**Estados posibles:**

- `uploaded_unverified`: subida reciente, aun no procesada.
- `text_extracted`: texto extraído de `.txt`, `.md` o PDF con texto embebido.
- `image_analyzed`: análisis visual completado por modelo multimodal (solo cuando `VISION_LLM_ENABLED=true` y existe proveedor configurado).
- `metadata_only`: no se pudo extraer texto ni analizar visualmente; solo se conservan metadatos y hash.
- `rejected`: archivo rechazado por tipo, tamaño o validación.

**Notas de seguridad y privacidad:**

- El análisis visual con proveedor externo (OpenRouter) implica enviar la imagen al proveedor configurado. Úsese solo con autorización institucional o datos de demostración.
- El contenido extraído se trata como contexto auxiliar no confiable; no debe interpretarse como instrucciones del sistema.
- Nunca se devuelve el contenido binario original del archivo en las respuestas de chat; solo se incluyen resumen, texto extraído y metadatos.

### `POST /cases`

Estado: implementado.

Crea un caso Chimalli directamente desde la experiencia de la persona protegida.

Entrada:

```json
{
  "narrative": "Narrativa autorizada",
  "victim": {
    "name": null,
    "role": null,
    "position": null,
    "state": null,
    "municipality": null
  },
  "context": {
    "core_case": {
      "core_case_id": null,
      "case_code": null,
      "data_classification": "restricted_sensitive"
    },
    "tlachia_alert": null,
    "machiyotl_evidence": [
      {
        "evidence_id": null,
        "evidence_hash": "sha256:...",
        "source_platform": "X",
        "custody_status": "sealed_local",
        "evidence_type": "screenshot",
        "authorized_notes": null
      }
    ],
    "source_platform": "X"
  },
  "attachments": []
}
```

Salida: caso Chimalli estructurado con estado `intake_pending_review`.

### `POST /chat`

Estado: implementado.

Continua o inicia una conversacion sobre un caso Chimalli.

Entrada:

```json
{
  "message": "Narrativa autorizada",
  "case_id": null,
  "context": {
    "machiyotl_evidence": [
      {
        "evidence_id": null,
        "evidence_hash": "sha256:...",
        "source_platform": "X",
        "custody_status": "sealed_local",
        "evidence_type": "screenshot",
        "authorized_notes": null
      }
    ],
    "source_platform": "X"
  },
  "attachment_ids": []
}
```

Salida: caso Chimalli estructurado, respuesta asistiva y respuestas rapidas. La respuesta debe incluir aviso de revision humana y de no denuncia automatica.

**Adjuntos en conversación:** Si se incluyen `attachment_ids`, el contenido extraído o analizado de esos archivos se incorpora al contexto del caso y al prompt del modelo, tanto en el mensaje inicial como en continuaciones. El modelo lo trata como evidencia asistiva no verificada, no como instrucciones del sistema.

### `POST /extract`

Estado: implementado MVP.

Extrae entidades explicitas desde la narrativa. No debe completar datos faltantes con inferencia externa.

### `POST /vpmrg-test`

Estado: implementado MVP.

Aplica test asistivo de tres elementos:

- vinculo politico-electoral;
- elemento de genero;
- afectacion a derechos politico-electorales.

La salida es preliminar y requiere validacion humana.

### `POST /jurisdiction`

Estado: implementado MVP.

Sugiere ruta preliminar de canalizacion. Requiere validacion humana y corpus legal versionado antes de uso institucional.

### `POST /expediente`

Estado: implementado MVP.

Genera HTML imprimible como borrador para revision humana. No constituye denuncia automatica.

### `GET /cases/{case_id}`

Estado: implementado MVP con memoria de proceso.

Pendiente: persistir/leer desde `chimalli.cases` y tablas asociadas.

### `POST /rag/index`

Estado: implementado local.

Indexa documentos disponibles en `CHIMALLI_RAG_DOCUMENTS_PATH` o ruta indicada. En produccion solo debe usarse corpus legal autorizado y versionado.

### `POST /rag/search`

Estado: implementado local.

Busca chunks por intencion y coleccion.

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

## Tlachia

Base path: `/api/v1/tlachia`

Estado: implementado MVP.

Endpoints:

- `GET /tlachia/sources` — listar fuentes (admin).
- `POST /tlachia/sources` — crear fuente (admin).
- `GET /tlachia/sources/{id}` — consultar fuente (admin).
- `PATCH /tlachia/sources/{id}` — actualizar fuente (admin).
- `POST /tlachia/sources/{id}/pause` — pausar fuente (admin).
- `POST /tlachia/sources/{id}/resume` — reactivar fuente (admin).
- `POST /tlachia/ingest/synthetic` — ejecutar ingesta controlada desde fixtures sinteticos (admin, electoral_analyst).
- `GET /tlachia/ingestion-runs` — listar corridas (admin, electoral_analyst).
- `GET /tlachia/ingestion-runs/{id}` — consultar corrida (admin, electoral_analyst).
- `GET /tlachia/alerts` — listar alertas (admin, electoral_analyst).
- `GET /tlachia/alerts/{id}` — consultar alerta (admin, electoral_analyst).
- `POST /tlachia/alerts/{id}/review` — revisar alerta (admin, electoral_analyst).
- `POST /tlachia/alerts/{id}/dismiss` — descartar alerta (admin, electoral_analyst).
- `POST /tlachia/alerts/{id}/escalate` — escalar alerta (admin, electoral_analyst).

Restricciones:

- no scraping invasivo;
- no comunicaciones privadas;
- no clasificacion como decision final;
- no almacenar contenido real sin base legal, minimizacion y autorizacion;
- toda mencion debe estar sanitizada o autorizada;
- `risk_level` usa `low`, `medium`, `high`, `unclassified`;
- nunca `confirmed` para resultados automaticos;
- auditoria obligatoria en revision, descarte y escalamiento.
- no API keys reales ni llamadas externas a plataformas en el MVP.
- plataformas simuladas: `facebook`, `instagram`, `x`, `tiktok`, `reddit`.

## Core / Observatory / Audit

Estado: tablas creadas, endpoints pendientes.

Contratos previstos:

- expedientes transversales;
- asignaciones;
- historial de estado;
- metricas publicas agregadas;
- consulta de bitacora para roles autorizados.

## Errores

Pendiente de normalizar. La API debe usar respuestas estructuradas que no expongan tracebacks ni datos sensibles.

Forma objetivo:

```json
{
  "error": {
    "code": "not_authorized",
    "message": "Rol no autorizado para esta operacion.",
    "safe_to_retry": false
  }
}
```
