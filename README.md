# Yaocíhuatl

**Significado:** "mujer guerrera" en náhuatl.

**Tagline:** `Tlachia observa · Machiyotl sella · Chimalli protege`

Yaocíhuatl es una plataforma institucional para detección, certificación forense y canalización de casos de violencia política contra las mujeres en razón de género (VPMRG) en entornos digitales. El repositorio inicia como un monorepo full-stack preparado para desarrollo colaborativo, auditoría técnica y despliegue institucional.

> Estado actual: MVP demo desplegable con frontend unificado, backend FastAPI, Chimalli integrado, PostgreSQL/Redis en Docker, migraciones iniciales, autenticación demo y datos sintéticos. No hay scraping, decisiones legales automáticas ni datos reales.

## Módulos Principales

- **Tlachia:** monitoreo, ingesta controlada, análisis contextual y detección asistida de señales de VPMRG.
- **Machiyotl:** certificación forense, sellado de evidencia, hash SHA-256, verificación y PWA offline-first.
- **Chimalli:** canalización legal asistida mediante IA/RAG, extracción de entidades, orientación jurisdiccional y generación de expedientes.

## Flujo Institucional

1. **Detección:** identificación asistida de señales, patrones, coordinación o riesgo.
2. **Sello forense:** preservación de evidencia digital con metadatos mínimos, hash y cadena de custodia.
3. **Cese inmediato en plataforma:** preparación de solicitudes y rutas institucionales para mitigar daño.
4. **Canalización:** orientación legal, integración de expediente y derivación a autoridades competentes.

## Roles

- **Mujer protegida:** persona usuaria que requiere preservar evidencia, recibir orientación y activar rutas de protección.
- **Autoridad electoral:** institución responsable de recibir, analizar, canalizar o dar seguimiento a casos.
- **Persona juzgadora:** autoridad que puede revisar evidencia, trazabilidad y contexto legal documentado.
- **Observación ciudadana:** ciudadanía, academia u organizaciones que consultan datos agregados y anonimizados.

## Stack Previsto

Este stack es una intención técnica inicial. No está instalado ni implementado todavía.

- **Frontend:** Next.js, React, TypeScript, Tailwind, shadcn/ui.
- **Backend:** Python, FastAPI, Pydantic.
- **DB:** PostgreSQL, pgvector.
- **Workers:** Celery, Redis.
- **IA/NLP:** Transformers, spaCy, sentence-transformers, LangChain/LangGraph.
- **PWA/Forense:** Web Crypto API, IndexedDB, Workbox.
- **Infra:** Docker, GitHub Actions.

## Principios

- Privacidad por diseño y minimización de datos.
- Clasificación asistiva, no decisoria.
- Evidencia con trazabilidad y cadena de custodia.
- Corpus legal versionado para cualquier funcionalidad jurídica.
- Human-in-the-loop en decisiones sensibles.
- Separación estricta entre demo, desarrollo y datos reales.

## Licencia

Licencia prevista: Apache 2.0. El archivo `LICENSE` actual es un placeholder y debe reemplazarse por el texto oficial antes de una liberación pública.

## Ejecucion Local Docker (MVP Chimalli)

Para levantar backend + frontend unificado + PostgreSQL + Redis:

```bash
docker compose up -d --build
```

Servicios principales:

- Frontend principal (landing + módulos): `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Healthcheck: `http://localhost:8000/health`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

En desarrollo, el backend aplica migraciones y carga datos demo sintéticos al iniciar. Las credenciales demo son:

| Rol | Usuario | Contraseña |
|---|---|---|
| Mujer protegida | `mujer` | `protegida` |
| Autoridad electoral / Analista | `analista` | `electoral` |
| Persona juzgadora / Revisor | `revisor` | `juzgadora` |
| Observación ciudadana | `observador` | `ciudadana` |

El badge “Demo” significa que el despliegue usa datos sintéticos, credenciales públicas y acciones revisables/simuladas. La aplicación sí corre sobre backend, Postgres y APIs reales, pero no contiene datos reales ni realiza determinaciones legales definitivas.

Variables base en `.env.example`:

- `FRONTEND_URL`, `FRONTEND_URLS`, `FRONTEND_PORT`
- `BACKEND_URL`, `BACKEND_PORT`
- `NEXT_PUBLIC_API_URL`
- `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`
- `RUN_MIGRATIONS_ON_START`, `SEED_DEMO_DATA`, `DEMO_SEED_VERSION`
- `LOCAL_EVIDENCE_STORAGE_PATH`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CHIMALLI_DEMO_MODE`

Comandos útiles:

```bash
docker compose exec backend alembic current
docker compose exec backend python -m app.seed.demo_data
docker compose exec backend pytest -q
```

Apagado:

```bash
docker compose down
```
