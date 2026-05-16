# Arquitectura Tecnica

Este documento complementa `ARCHITECTURE.md` con detalles tecnicos del estado actual.

## Monorepo

```text
frontend/apps/demo/          App Next.js principal desplegada
frontend/apps/chimalli-chat/ App previa/aislada de Chimalli
backend/app/                 FastAPI, servicios, schemas, DB
backend/migrations/          Alembic
backend/modules/             Documentacion por modulo
infra/                       Docker, Caddy, observabilidad
docs/technical/              Documentacion tecnica viva
```

## Runtime

- Frontend: Next.js 15, React 19, TypeScript, Tailwind.
- Backend: FastAPI, Pydantic v2, SQLAlchemy 2, Alembic.
- DB: PostgreSQL 17 + pgvector + pgcrypto.
- Cache: Redis 7.
- Despliegue: Docker Compose en AWS EC2 Ubuntu.

## Backend

Entrada principal:

- `backend/app/main.py`
- `backend/app/api/v1/router.py`

Servicios actuales:

- `auth`: login demo, JWT bearer, sesiones y auditoria de fallos.
- `chimalli`: caso estructurado, extraccion heuristica, test asistivo, sugerencia de jurisdiccion, expediente HTML y RAG local.

Servicios pendientes:

- `tlachia`: ingesta real, normalizacion, alertas, revision y sanitizacion.
- `machiyotl`: carga/almacenamiento de evidencia, hash, custodia y verificacion.
- `core`: endpoints de expedientes transversales.
- `observatory`: consulta publica agregada.

## Frontend

`frontend/apps/demo` es la app principal. Contiene experiencia real navegable, pero no todas las pantallas tienen backend conectado.

Conectado a backend:

- Chimalli chat usa `/api/v1/chimalli/chat`.

Pendiente de conexion:

- Tlachia.
- Machiyotl.
- Verificacion de hashes.
- Casos/revisor.
- Privacidad/consentimiento.
- Observatorio publico.

## Dependencias Entre Modulos

Regla: ningun modulo debe depender directamente de tablas internas de otro modulo para implementar su logica sensible.

Permitido:

- vincular por `core.cases`;
- referenciar IDs necesarios mediante contratos;
- registrar auditoria comun;
- consultar IAM para permisos.

No permitido:

- que Tlachia escriba evidencia de Machiyotl directamente;
- que Chimalli confirme juridicamente una alerta de Tlachia;
- que Machiyotl infiera clasificacion legal;
- mezclar datos crudos de monitoreo con expedientes legales sin sanitizacion y consentimiento.

## IA

Chimalli debe operar con estas garantias:

- respuesta en espanol claro;
- aviso de revision humana;
- no denuncia automatica;
- no culpabilidad;
- no citas inventadas;
- corpus versionado antes de produccion legal;
- logs minimizados.

Tlachia, cuando se implemente, debera usar etiquetas como `low`, `medium`, `high`, `unclassified`; nunca `confirmed` para salidas de IA.

## Persistencia

La persistencia real esta en PostgreSQL. El servicio Chimalli MVP todavia conserva casos generados en memoria de proceso para algunos endpoints; las tablas `chimalli.*` ya existen para migrar esa funcionalidad a persistencia durable.

Ver `docs/technical/data-model.md` para detalle por esquema.
