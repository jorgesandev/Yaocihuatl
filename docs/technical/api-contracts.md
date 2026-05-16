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

## Machiyotl

Estado: pendiente de API real.

Contratos previstos:

- registrar evidencia sellada;
- subir archivo autorizado;
- registrar evento de custodia;
- verificar hash;
- asociar evidencia con caso;
- generar reporte forense.

Restricciones:

- preservar cadena de custodia;
- distinguir almacenamiento local/offline de almacenamiento servidor;
- cifrar en reposo antes de datos reales;
- documentar metadatos minimos;
- no aceptar evidencia real en modo demo.

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
