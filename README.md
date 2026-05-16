# Yaocihuatl

**Significado:** "mujer guerrera" en nahuatl.
**Tagline:** `Tlachia observa · Machiyotl sella · Chimalli protege`

Yaocihuatl es una plataforma institucional para detectar, documentar, preservar y canalizar casos de violencia politica contra las mujeres en razon de genero (VPMRG) en entornos digitales.

El proyecto ya no esta en una fase puramente conceptual: la aplicacion real esta desplegada en `https://yaocihuatl.com` sobre AWS EC2 Ubuntu, con servicios Dockerizados, frontend Next.js, backend FastAPI, PostgreSQL/pgvector, Redis, migraciones iniciales, autenticacion base y datos sinteticos de demostracion. La implementacion se esta convirtiendo gradualmente en flujo funcional real, manteniendo separacion estricta entre demo, datos anonimizados/autorizados y cualquier dato sensible.

> Estado actual: MVP desplegado con arquitectura real y datos sinteticos. Chimalli tiene endpoints backend funcionales para asistencia preliminar, RAG local y expediente borrador. Auth demo existe y sera evolucionada a login institucional. Tlachia y Machiyotl tienen pantallas y modelo de datos inicial, pero sus APIs reales aun deben implementarse con documentacion tecnica, legal y etica antes de procesar informacion sensible.

## Principios Innegociables

- No se suben datos reales de victimas, agresores, cuentas personales, evidencia sensible ni expedientes reales a ambientes demo.
- La IA es asistiva, no decisoria: no confirma VPMRG, no declara culpabilidad y no sustituye revision humana.
- Toda funcionalidad juridica debe citar corpus legal versionado en `legal-corpus/`.
- Toda evidencia debe preservar cadena de custodia, trazabilidad y controles de acceso.
- No se implementa scraping invasivo, vigilancia masiva ni acceso a comunicaciones privadas.
- Tlachia, Machiyotl y Chimalli se mantienen separados por modulo, contratos y responsabilidades.

## Modulos

| Modulo | Rol de producto | Estado actual |
|---|---|---|
| **Tlachia** | Observacion, alertas, revision de senales y riesgo asistivo. | UI demo, tablas de base de datos y seed sintetico. La ingesta real y los clasificadores quedan pendientes de especificacion. |
| **Machiyotl** | Captura/sellado de evidencia, hashes SHA-256, notas y cadena de custodia. | UI demo, tablas de evidencia/custodia y archivo sintetico seed. La PWA forense real queda pendiente de especificacion. |
| **Chimalli** | Asistente legal/RAG, extraccion estructurada, test asistivo VPMRG y expediente borrador. | Backend funcional MVP con endpoints `/api/v1/chimalli/*`, modo demo/LLM configurable y aviso obligatorio de revision humana. |
| **IAM/Core/Audit** | Login, roles, sesiones, expedientes transversales, auditoria. | Fundacion en PostgreSQL y endpoints `/api/v1/auth/login` y `/api/v1/auth/me`. Login institucional/RBAC completo sigue en construccion. |
| **Observatory** | Metricas publicas agregadas y anonimizadas. | Tabla y seed sintetico con umbral k-anonimato; sin publicacion de datos reales. |

## Flujo Producto

El flujo objetivo es:

1. **Deteccion:** Tlachia identifica senales publicas y genera alertas explicables para revision humana.
2. **Sello forense:** Machiyotl preserva evidencia antes de cualquier reporte o eliminacion de contenido.
3. **Cese inmediato en plataforma:** la persona protegida recibe guia para reportar el contenido ante la plataforma correspondiente, sin que Yaocihuatl modere ni censure directamente.
4. **Canalizacion:** Chimalli ordena la narrativa, cita fuentes disponibles, sugiere rutas preliminares y genera borradores para validacion institucional.

En el despliegue actual este flujo esta representado por UI navegable, seed sintetico y endpoints reales de Chimalli/auth. La conexion API completa de Tlachia y Machiyotl sera el siguiente bloque de trabajo.

## Roles

| Rol | Uso previsto | Estado actual |
|---|---|---|
| Mujer protegida | Preservar evidencia, revisar privacidad y recibir orientacion. | Usuario demo `mujer`. |
| Autoridad electoral / Analista | Revisar alertas, expedientes, senales y rutas. | Usuario demo `analista`. |
| Persona juzgadora / Revisora | Verificar evidencia, hashes, cronologia y contexto documentado. | Usuario demo `revisor`. |
| Observacion ciudadana | Consultar datos agregados y anonimizados. | Usuario demo `observador`. |

Credenciales demo locales:

| Rol | Usuario | Contrasena |
|---|---|---|
| Mujer protegida | `mujer` | `protegida` |
| Autoridad electoral / Analista | `analista` | `electoral` |
| Persona juzgadora / Revisora | `revisor` | `juzgadora` |
| Observacion ciudadana | `observador` | `ciudadana` |

Estas credenciales son publicas y solo deben usarse con datos sinteticos.

## Stack Real Actual

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Lucide React, Recharts.
- **Backend:** FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, PyJWT, psycopg.
- **Base de datos:** PostgreSQL 17 con imagen `pgvector/pgvector:pg17`, extensiones `pgcrypto` y `vector`.
- **Cache/colas futuras:** Redis 7 Alpine. Celery/worker esta preparado en compose como servicio futuro, aun comentado.
- **IA/RAG:** Chimalli usa servicio LLM configurable (`DeepSeek` directo u `OpenRouter`) y RAG local por documentos/index JSONL. En modo demo puede responder sin proveedor externo.
- **Infra:** Docker Compose dev/prod, AWS EC2 Ubuntu, Caddy/reverse proxy previsto en `infra/deployment/Caddyfile`.

## Estructura

```text
frontend/apps/demo/              Aplicacion principal desplegada
frontend/apps/chimalli-chat/     App aislada previa de Chimalli
backend/app/api/v1/              Endpoints FastAPI versionados
backend/app/services/auth/       Login, JWT y sesiones
backend/app/services/chimalli/   Servicios MVP Chimalli, RAG y LLM
backend/app/db/models.py         Modelos SQLAlchemy por esquema
backend/migrations/              Migracion base Alembic
backend/modules/                 Documentacion por modulo de dominio
docs/technical/                  Arquitectura, datos, API y despliegue
docs/product/                    Propuesta producto y flujos
infra/                           Docker, despliegue y observabilidad
legal-corpus/                    Corpus legal versionado pendiente de curaduria
prompts/                         Prompts versionados
datasets/                        Solo demo, sintetico o anonimizado
```

## Base de Datos

La migracion base `20260515_0001_platform_foundation` crea esquemas separados:

- `iam`: organizaciones, roles, usuarios, sesiones, consentimientos y preferencias.
- `core`: expedientes transversales, asignaciones y cambios de estado.
- `tlachia`: alertas, senales explicables, menciones sanitizadas y clusters.
- `machiyotl`: evidencias, hashes, notas, eventos de custodia y verificaciones.
- `chimalli`: casos, mensajes, extracciones, test VPMRG asistivo, rutas, fuentes RAG y logs LLM.
- `observatory`: metricas agregadas publicables con umbral de anonimato.
- `audit`: bitacora de acciones, accesos relevantes y seeds.

El seed demo crea usuarios, roles, un caso sintetico, una alerta Tlachia sintetica, evidencia placeholder sellada, un caso Chimalli y metricas agregadas. En produccion no debe correrse seed demo con datos publicos.

## Ejecucion Local

Crear `.env` desde `.env.example` y ajustar secretos:

```bash
cp .env.example .env
docker compose up -d --build
```

Servicios locales:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Healthcheck: `http://localhost:8000/health`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Comandos utiles:

```bash
docker compose exec backend alembic current
docker compose exec backend python -m app.seed.demo_data
docker compose exec backend pytest -q
npm run lint
npm run typecheck
```

## Despliegue Actual

El despliegue real vive en AWS EC2 Ubuntu y usa `docker-compose.prod.yml`. En produccion los puertos de frontend/backend se enlazan a `127.0.0.1`; el trafico publico debe pasar por reverse proxy/TLS.

```bash
git clone git@github.com:LexHackersClub/Yaocihuatl.git /opt/yaocihuatl
cd /opt/yaocihuatl
cp .env.example .env
# Editar .env con secretos reales y URLs publicas
docker compose -f docker-compose.prod.yml up -d --build
```

Variables criticas:

- `APP_ENV=production`
- `FRONTEND_URL=https://yaocihuatl.com`
- `FRONTEND_URLS=https://yaocihuatl.com`
- `NEXT_PUBLIC_API_URL=https://yaocihuatl.com` o URL publica de API segun proxy
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `RUN_MIGRATIONS_ON_START`
- `SEED_DEMO_DATA` debe revisarse antes de cualquier ambiente no demo
- `CHIMALLI_DEMO_MODE`
- `DEEPSEEK_API_KEY` u `OPENROUTER_API_KEY`, si se habilita LLM externo

## Responsabilidades Inmediatas

- **Jorge / Tlachia:** documentar e implementar flujo real de monitoreo/alertas con APIs permitidas, datos publicos autorizados, explicabilidad, limites y revision humana.
- **Companero Machiyotl:** implementar PWA/flujo forense real con hash local, cadena de custodia, almacenamiento, consentimiento y retencion.
- **Companero Chimalli:** fortalecer RAG/corpus, citacion versionada, endpoints persistentes y generacion de expediente como borrador revisable.
- **Equipo completo:** evolucionar login demo a login institucional, RBAC, auditoria, despliegue, seguridad, pruebas y documentacion legal/etica.

## Documentacion Clave

- `ARCHITECTURE.md`: arquitectura real y objetivo incremental.
- `docs/technical/data-model.md`: modelo de datos por esquema.
- `docs/technical/api-contracts.md`: endpoints actuales y contratos pendientes.
- `docs/technical/deployment.md`: despliegue Docker/AWS.
- `SECURITY.md`: reglas de seguridad y privacidad.
- `DESIGN.md`: sistema visual, tono y accesibilidad.
- `docs/product/Yaocihuatl_Propuesta_Final_v3.md`: propuesta producto version 3.

## Licencia

Licencia prevista: Apache 2.0. El archivo `LICENSE` debe contener el texto oficial antes de una liberacion publica.
