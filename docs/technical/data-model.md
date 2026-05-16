# Modelo de Datos

El modelo actual ya existe en PostgreSQL mediante Alembic y SQLAlchemy. La migracion base `20260515_0001_platform_foundation` crea una fundacion para login, expedientes, alertas, evidencia, Chimalli, metricas publicas y auditoria.

Cualquier modelo relacionado con evidencia, victimas, agresores, cuentas, expedientes o decisiones juridicas debe justificar minimizacion, retencion, controles de acceso, auditoria y separacion entre datos demo/sinteticos/anonimizados/reales.

## Extensiones

- `pgcrypto`: UUIDs y utilidades criptograficas.
- `vector`: soporte pgvector para fuentes RAG futuras.

## Esquemas

### `iam`

Identidad, roles, sesiones y privacidad.

| Tabla | Uso |
|---|---|
| `organizations` | Organismos o grupos demo/institucionales. |
| `roles` | Roles: mujer protegida, analista, revisor, observacion. |
| `users` | Usuarios con hash de contrasena, estado e indicador demo. |
| `user_roles` | Relacion muchos-a-muchos usuario/rol. |
| `sessions` | Tokens emitidos, expiracion, revocacion e informacion minima de cliente. |
| `consents` | Consentimientos versionados. |
| `privacy_preferences` | Preferencias de notificacion, retencion y uso agregado. |

Pendiente antes de datos reales:

- politicas de contrasena y recuperacion;
- revocacion y rotacion operativa;
- consentimiento institucional revisado;
- RBAC por recurso;
- auditoria de cambios de privacidad.

### `core`

Expedientes transversales.

| Tabla | Uso |
|---|---|
| `cases` | Caso comun entre modulos, estado, prioridad y resumen. |
| `case_assignments` | Asignacion de usuarios a casos. |
| `case_status_history` | Cambios de estado con actor y razon. |

`core.cases.data_classification` debe distinguir `synthetic_demo`, `anonymized`, `authorized_real` u otra clasificacion aprobada antes de manejar datos reales.

### `tlachia`

Alertas, senales explicables y observacion asistiva.

| Tabla | Uso |
|---|---|
| `sources` | Fuentes configuradas por analistas/admins (ej. subreddit Reddit). |
| `ingestion_runs` | Bitacora tecnica de cada corrida de ingesta. |
| `reddit_items` | Registro minimo para deduplicacion y cumplimiento. No guarda contenido crudo completo. |
| `alerts` | Alerta revisable, riesgo asistivo, plataforma y motivo. |
| `alert_signals` | Senales que explican por que existe la alerta. |
| `sanitized_mentions` | Fragmentos sanitizados/autorizados, no comunicaciones privadas. |
| `clusters` | Agrupaciones de actividad con patron de coordinacion. |
| `cluster_alerts` | Relacion cluster/alerta. |

Reglas:

- `risk_level` debe usar `low`, `medium`, `high` o `unclassified`.
- No usar `confirmed` para resultados de IA.
- No guardar contenido privado.
- No inferir identidad de agresores sin fuente autorizada.
- `reddit_items` solo guarda extractos sanitizados y metadatos permitidos (score, numero de comentarios, flag over_18, flair, hash de similitud). Prohibido: perfil completo del autor, karma, historial, mensajes privados, datos de localizacion.

### `machiyotl`

Evidencia, hash y custodia.

| Tabla | Uso |
|---|---|
| `evidence_items` | Metadatos, hash SHA-256, estado y ubicacion del archivo. |
| `evidence_notes` | Notas revisables asociadas a evidencia. |
| `custody_events` | Eventos de cadena de custodia. |
| `hash_verifications` | Intentos/resultados de verificacion de hash. |

Estados actuales en seed:

- `sealed-local`
- `local-file-demo`

Antes de evidencia real se requiere:

- cifrado en reposo;
- almacenamiento aprobado;
- politica de retencion;
- control de acceso por caso;
- bitacora de cada acceso;
- procedimiento de exportacion y verificacion.

### `chimalli`

Asistencia legal/RAG.

| Tabla | Uso |
|---|---|
| `cases` | Caso Chimalli vinculado opcionalmente a `core.cases`. |
| `messages` | Mensajes del flujo conversacional. |
| `extractions` | Entidades o estructuras extraidas, editables. |
| `vpmrg_tests` | Resultado asistivo del test de tres elementos. |
| `routing_suggestions` | Ruta preliminar y alternativas. |
| `rag_sources` | Chunks/fuentes RAG con metadata y embedding futuro. |
| `case_rag_sources` | Fuentes asociadas a un caso y ranking. |
| `llm_interaction_logs` | Metadata minimizada de interacciones LLM. |

Nota: el servicio MVP aun genera algunos casos en memoria de proceso. Estas tablas son la ruta de persistencia durable.

Reglas:

- toda salida legal debe citar fuente, version, fecha y ubicacion en `legal-corpus/`;
- no guardar prompts completos con datos sensibles salvo aprobacion expresa;
- no presentar denuncia automaticamente;
- toda sugerencia queda en estado revisable.

### `observatory`

Metricas publicas agregadas.

| Tabla | Uso |
|---|---|
| `aggregate_metrics` | Conteos por fecha, tipo y dimension con umbral k-anonimato. |

Reglas:

- `is_publishable` solo puede ser verdadero si cumple umbral y revision.
- No exponer nombres, cuentas, URLs, contenido ni identificadores.

### `audit`

Bitacora transversal.

| Tabla | Uso |
|---|---|
| `audit_log` | Actor, accion, entidad, resultado, cliente y metadata. |

Eventos minimos esperados:

- login exitoso/fallido;
- lectura de expediente;
- lectura/descarga/verificacion de evidencia;
- cambios de estado;
- cambios de consentimiento;
- generacion de expediente;
- acciones administrativas.

## Seed Demo

`backend/app/seed/demo_data.py` crea:

- 4 usuarios demo;
- roles por perfil;
- organizaciones demo;
- consentimientos y preferencias;
- 1 caso core sintetico;
- asignaciones a analista y revisor;
- 1 evidencia placeholder con SHA-256;
- 1 evento de custodia;
- 1 alerta Tlachia sintetica;
- 1 cluster y mencion sanitizada;
- 1 caso Chimalli sintetico;
- 1 fuente RAG demo;
- metricas agregadas publicables;
- evento de auditoria de seed.

El seed lanza error si `APP_ENV=production`, pero el despliegue productivo tambien debe configurar `SEED_DEMO_DATA=false` antes de usar cualquier dato no sintetico.

## Clasificacion De Datos

Vocabulario recomendado:

- `synthetic_demo`: datos inventados para demo.
- `anonymized`: datos anonimizados con revision de reidentificacion.
- `authorized_real`: datos reales con base legal/autorizacion documentada.
- `restricted_sensitive`: evidencia o datos sensibles con acceso restringido.

No mezclar clasificaciones en el mismo flujo sin registrar origen, consentimiento, retencion y responsables.
