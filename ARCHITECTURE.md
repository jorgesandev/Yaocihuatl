# Arquitectura

Yaocihuatl es un monorepo full-stack institucional desplegado actualmente en `yaocihuatl.com` sobre AWS EC2 Ubuntu con servicios Dockerizados. La arquitectura combina una aplicacion Next.js, una API FastAPI, PostgreSQL/pgvector, Redis y una separacion por dominios para Tlachia, Machiyotl y Chimalli.

El objetivo arquitectonico no es construir una herramienta de moderacion o vigilancia, sino una plataforma auditable para deteccion asistiva, preservacion de evidencia y canalizacion con revision humana.

Para el flujo producto-tecnico entre interfaces y modulos, ver `docs/product/module-interaction-flow.md`.

## Estado Actual

| Capa | Implementado | Pendiente |
|---|---|---|
| Frontend | App principal `frontend/apps/demo` con rutas de producto, roles, dashboard, Chimalli, Tlachia, Machiyotl, privacidad, verificacion y vistas publicas. | Conectar todas las pantallas a APIs reales; sustituir mocks de Tlachia/Machiyotl por servicios versionados. |
| Backend | FastAPI con healthcheck, router `/api/v1`, auth demo, Chimalli MVP, configuracion LLM/RAG, SQLAlchemy y Alembic. | Endpoints persistentes para Tlachia, Machiyotl, casos, auditoria, RBAC granular y observatorio. |
| Datos | PostgreSQL/pgvector con esquemas `iam`, `core`, `tlachia`, `machiyotl`, `chimalli`, `observatory`, `audit`. | Cifrado/retencion institucional, backups, politicas de minimizacion y migraciones por modulo. |
| Infra | Docker Compose dev/prod, EC2 Ubuntu, Redis, volumen de evidencia demo y reverse proxy previsto. | Hardening completo, TLS/proxy documentado, monitoreo, backups, CI/CD y rotacion de secretos. |
| IA/RAG | Chimalli con RAG local, LLM configurable y modo demo. | Corpus legal curado/versionado, citacion obligatoria por fuente, evaluaciones y controles de no decision. Clasificador BETO/DeepSeek para las 19 conductas es objetivo futuro (fase 2). |

## Vista de Componentes

```text
Usuario / Autoridad / Revision
        |
        v
Next.js frontend (frontend/apps/demo)
        |
        v
FastAPI backend (/api/v1)
        |
        +--> Auth/IAM service
        +--> Chimalli service: extraccion, test asistivo, RAG, expediente borrador
        +--> Tlachia service: pendiente de API real
        +--> Machiyotl service: pendiente de API real
        |
        v
PostgreSQL + pgvector
        |
        +--> iam
        +--> core
        +--> tlachia
        +--> machiyotl
        +--> chimalli
        +--> observatory
        +--> audit

Redis queda disponible para cache, sesiones auxiliares o colas futuras.
```

## Capas

### Presentacion

La aplicacion principal esta en `frontend/apps/demo` y usa Next.js App Router. Aunque el nombre historico sea `demo`, es la app desplegada y contiene la experiencia unificada:

- landing/inicio institucional;
- onboarding;
- dashboard por rol;
- pantallas de Tlachia, Machiyotl y Chimalli;
- vistas de caso, evidencia, privacidad, verificacion, revisor y observatorio publico.

Estado importante: Chimalli puede llamar al backend real; Tlachia y Machiyotl aun usan datos mock/sinteticos en frontend mientras se construyen sus APIs.

### API

El backend vive en `backend/app`:

- `app.main` crea la aplicacion FastAPI, CORS y healthcheck.
- `app.api.v1.router` agrupa `/api/v1/auth` y `/api/v1/chimalli`.
- `app.api.deps` contiene dependencias de DB, bearer token y roles.
- `app.services.auth` maneja hashing, JWT, sesiones y auditoria de login.
- `app.services.chimalli` maneja casos en memoria de proceso, extraccion heuristica, RAG local, LLM configurable y expediente HTML borrador.

Los endpoints actuales son:

- `GET /health`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/chimalli/chat`
- `POST /api/v1/chimalli/extract`
- `POST /api/v1/chimalli/vpmrg-test`
- `POST /api/v1/chimalli/jurisdiction`
- `POST /api/v1/chimalli/expediente`
- `GET /api/v1/chimalli/cases/{case_id}`
- `POST /api/v1/chimalli/rag/index`
- `POST /api/v1/chimalli/rag/search`

### Dominio

La separacion de responsabilidades es obligatoria:

- **Tlachia** solo debe operar sobre fuentes publicas, autorizadas o sinteticas. Sus salidas son alertas y senales para revision humana, no confirmaciones.
- **Machiyotl** se ocupa de evidencia, integridad, hash, metadatos, custodia y verificacion. No decide rutas legales ni clasifica violencia.
- **Chimalli** ordena narrativas, recupera fuentes, sugiere rutas preliminares y genera borradores revisables. No presenta denuncias automaticamente.
- **Core** une casos transversales sin absorber logica especifica de cada modulo.
- **IAM/Audit** cruza todos los modulos para identidad, roles, sesiones y trazabilidad.

## Modelo de Datos

La migracion base crea estos esquemas:

### `iam`

Identidad y acceso:

- `organizations`
- `roles`
- `users`
- `user_roles`
- `sessions`
- `consents`
- `privacy_preferences`

Actualmente se usa para login demo y roles iniciales. El siguiente paso es consolidar login institucional con RBAC real, caducidad/rotacion de tokens y politicas de contrasenas en el MVP. OIDC y proveedor institucional son objetivo futuro (fase 2).

### `core`

Expedientes transversales:

- `cases`
- `case_assignments`
- `case_status_history`

`core` no debe contener logica especifica de IA, evidencia o monitoreo; solo relaciones y estado compartido.

### `tlachia`

Observacion asistiva:

- `alerts`
- `alert_signals`
- `sanitized_mentions`
- `clusters`
- `cluster_alerts`

Debe almacenar solo menciones sanitizadas o autorizadas, con explicabilidad y revision humana. No se deben guardar comunicaciones privadas ni datos recolectados por scraping invasivo.

### `machiyotl`

Evidencia y custodia:

- `evidence_items`
- `evidence_notes`
- `custody_events`
- `hash_verifications`

La evidencia demo actual es un archivo local sintetico. El diseno productivo requiere cifrado, retencion, control de acceso, almacenamiento institucional y eventos de custodia completos.

### `chimalli`

Asistencia legal:

- `cases`
- `messages`
- `extractions`
- `vpmrg_tests`
- `routing_suggestions`
- `rag_sources`
- `case_rag_sources`
- `llm_interaction_logs`

El servicio Chimalli actual usa memoria para casos generados por endpoint; las tablas son la fundacion para persistencia gradual. Cualquier salida legal debe citar corpus versionado y mantenerse como borrador para revision humana.

### `observatory`

Metricas publicas:

- `aggregate_metrics`

Solo debe publicar datos agregados, anonimizados y con umbral minimo. Nunca debe exponer nombres, cuentas, contenido de evidencia ni identificadores.

### `audit`

Bitacora:

- `audit_log`

Debe registrar acciones sensibles: login, fallos, cambios de caso, acceso a evidencia, verificacion de hash, generacion de expediente, cambios de consentimiento y operaciones administrativas.

## Despliegue

### Desarrollo

`docker-compose.yml` levanta:

- `postgres`
- `redis`
- `backend`
- `frontend`

En desarrollo el backend monta el codigo local, puede correr migraciones al iniciar y puede cargar seed sintetico.

### Produccion

`docker-compose.prod.yml` levanta los mismos servicios principales, pero:

- exige variables sensibles mediante `.env`;
- construye imagen frontend desde `frontend/apps/demo/Dockerfile`;
- publica backend/frontend solo en `127.0.0.1`;
- espera que un reverse proxy con TLS exponga `yaocihuatl.com`;
- usa volumen Docker para PostgreSQL, Redis y evidencia local.

Configuracion critica:

- `APP_ENV=production`
- `JWT_SECRET` fuerte y rotado fuera de git
- `POSTGRES_PASSWORD` y `REDIS_PASSWORD` reales
- `SEED_DEMO_DATA=false` para ambientes con cualquier dato no sintetico
- `CHIMALLI_DEMO_MODE` definido explicitamente
- claves LLM solo si la politica institucional permite proveedor externo

## Seguridad y Privacidad

Controles ya presentes:

- separacion por esquemas;
- datos demo marcados con `is_demo` / `synthetic_demo`;
- sesiones en tabla `iam.sessions`;
- auditoria basica de login y seed;
- CORS configurable por `FRONTEND_URLS`;
- hash de contrasenas para usuarios demo;
- avisos obligatorios de revision humana en Chimalli.

Controles pendientes antes de datos reales:

- RBAC granular por endpoint y recurso;
- cifrado de evidencia en reposo;
- politicas de retencion y borrado;
- backups cifrados y restauracion probada;
- rate limiting;
- logs sin datos sensibles;
- trazabilidad completa de cadena de custodia;
- revision de corpus legal versionado;
- evaluaciones contra alucinacion legal y sesgos;
- hardening de servidor, firewall, TLS y rotacion de secretos.

## Integraciones

### LLM

Chimalli soporta proveedor configurable:

- `LLM_PROVIDER=deepseek`
- `LLM_PROVIDER=openrouter`
- `CHIMALLI_DEMO_MODE=true` para operar sin decision automatica ni dependencia obligatoria externa.

No se debe enviar informacion sensible a proveedores externos sin base legal, consentimiento/documentacion institucional y minimizacion.

### Plataformas Digitales

Tlachia debera usar solo APIs oficiales, datasets sinteticos/anonimizados o fuentes expresamente autorizadas. WhatsApp, Telegram y comunicaciones privadas quedan fuera de alcance.

## Roadmap Tecnico Inmediato

1. Consolidar login institucional: usuarios reales controlados, RBAC por rol, sesiones, auditoria y proteccion de rutas frontend.
2. Implementar APIs reales de Tlachia con fuentes permitidas, ingesta controlada, alertas explicables y datos sanitizados.
3. Implementar Machiyotl real: hash local, carga segura, eventos de custodia, verificacion y almacenamiento cifrado.
4. Persistir Chimalli en PostgreSQL, conectar fuentes RAG versionadas y asegurar citacion legal verificable.
5. Documentar operacion en AWS: reverse proxy, TLS, backups, logs, monitoreo y procedimientos de emergencia.

## Reglas de Cambio

- Antes de implementar logica sensible, documentar supuestos, riesgos, entradas, salidas y limites.
- No mezclar datos demo, sinteticos, anonimizados y reales.
- No inventar marcos juridicos, criterios o fuentes.
- Mantener cambios pequenos, revisables y probables con tests cuando exista logica real.
