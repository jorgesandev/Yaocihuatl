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

Pendiente:

- politicas institucionales de contrasena;
- recuperacion/rotacion;
- RBAC por recurso;
- posible SSO o proveedor institucional.

### `GET /auth/me`

Estado: implementado.

Requiere `Authorization: Bearer <token>`.

Devuelve el usuario actual y sus roles.

## Chimalli

Base path: `/api/v1/chimalli`

Chimalli es asistencia preliminar. Ningun endpoint presenta denuncias automaticamente, confirma VPMRG ni sustituye asesoria legal o resolucion de autoridad.

### `POST /chat`

Estado: implementado.

Entrada:

```json
{
  "message": "Narrativa sintetica o autorizada",
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

Salida: caso Chimalli estructurado, respuesta asistiva y respuestas rapidas. La respuesta debe incluir aviso de revision humana y de no denuncia automatica.

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

Estado: pendiente de API real.

Contratos previstos:

- listar alertas;
- consultar alerta por ID;
- registrar revision humana;
- listar senales explicables;
- listar menciones sanitizadas;
- crear caso core desde alerta revisada.

Restricciones:

- no scraping invasivo;
- no comunicaciones privadas;
- no clasificacion como decision final;
- no almacenar contenido real sin base legal, minimizacion y autorizacion;
- toda mencion debe estar sanitizada o autorizada.

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
