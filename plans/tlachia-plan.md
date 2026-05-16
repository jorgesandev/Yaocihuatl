# Plan De Implementacion: Login Institucional Y Tlachia MVP Sintetico

Este plan define el camino verificable para implementar login, logica de usuarios y el modulo Tlachia usando datos sinteticos que emulan respuestas API de Facebook, Instagram, X, TikTok y Reddit. El MVP no usara API keys reales, OAuth de plataformas ni llamadas externas.

## Decision De Alcance

Antes el plan contemplaba Reddit API oficial. Se descarta por tiempos de aprobacion y dependencia externa. El nuevo camino es:

- fixtures JSON sinteticos;
- adaptadores por plataforma;
- normalizacion comun;
- reglas explicables;
- alertas revisables;
- dashboard conectado al backend;
- sin credenciales reales.

## Principios

- Tlachia genera alertas asistivas, no confirma VPMRG.
- Toda salida automatizada requiere revision humana.
- No se usan API keys reales.
- No se hacen llamadas externas a plataformas.
- No se hace scraping.
- No se usan datos reales, anonimizados ni de personas identificables en el MVP.
- Los fixtures deben ser claramente sinteticos.
- Cada fase terminada debe verificarse, commitearse y pushearse antes de continuar.

## Variables De Entorno

Agregar o mantener en `.env.example`:

```env
TLACHIA_INGESTION_ENABLED=false
TLACHIA_DEMO_MODE=true
TLACHIA_SYNTHETIC_MODE=true
TLACHIA_SYNTHETIC_FIXTURES_PATH=datasets/synthetic/tlachia
TLACHIA_SYNTHETIC_PLATFORMS=facebook,instagram,x,tiktok,reddit
TLACHIA_STORE_RAW_PLATFORM_CONTENT=false
TLACHIA_RETENTION_HOURS=48
TLACHIA_MIN_ALERT_SCORE=50
```

No agregar:

```env
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
YOUTUBE_API_KEY=
META_APP_SECRET=
X_BEARER_TOKEN=
TIKTOK_CLIENT_SECRET=
```

## Fixtures Sinteticos

Crear:

```text
datasets/synthetic/tlachia/
  README.md
  facebook-feed.json
  instagram-comments.json
  x-search.json
  tiktok-comments.json
  reddit-listing.json
```

Cada fixture debe declarar:

- `scenario`;
- `platform`;
- `synthetic: true`;
- `generated_for: "Yaocihuatl Tlachia MVP"`;
- `contains_real_personal_data: false`;
- lista de items.

## Contrato Normalizado

Todos los adaptadores convierten su fixture a:

```json
{
  "synthetic_id": "x_demo_001",
  "platform": "x",
  "source_kind": "post",
  "source_url": "https://example.invalid/x/demo/status/001",
  "author_label": "Cuenta demo 001",
  "author_synthetic_id": "acct_demo_001",
  "occurred_at": "2026-05-15T22:15:00Z",
  "text": "Texto sintetico de mencion.",
  "language": "es",
  "engagement": {
    "likes": 12,
    "shares": 3,
    "comments": 4
  },
  "metadata": {
    "fixture_file": "x-search.json",
    "scenario": "campaign-burst-demo",
    "synthetic": true
  }
}
```

## Modelo De Datos Propuesto

Crear migracion nueva, no modificar migracion base.

### `tlachia.sources`

- `id uuid primary key`
- `source_type varchar(40)` valor MVP: `synthetic`
- `platform varchar(40)` valores: `facebook`, `instagram`, `x`, `tiktok`, `reddit`
- `name varchar(160)`
- `scenario varchar(120)`
- `fixture_file varchar(260)`
- `query_terms jsonb`
- `protected_labels jsonb`
- `status varchar(40)` valores: `active`, `paused`, `disabled`
- `created_by_id uuid references iam.users(id)`
- `created_at timestamptz`
- `updated_at timestamptz`

### `tlachia.ingestion_runs`

- `id uuid primary key`
- `source_id uuid references tlachia.sources(id)`
- `provider varchar(40)` valor MVP: `synthetic`
- `platform varchar(40)`
- `scenario varchar(120)`
- `status varchar(40)` valores: `started`, `success`, `partial_failure`, `failure`
- `started_at timestamptz`
- `finished_at timestamptz`
- `items_seen integer`
- `items_stored integer`
- `alerts_created integer`
- `error_message text`
- `created_by_id uuid references iam.users(id)`

### `tlachia.platform_items`

- `id uuid primary key`
- `source_id uuid references tlachia.sources(id)`
- `synthetic_id varchar(120) unique`
- `platform varchar(40)`
- `source_kind varchar(40)`
- `source_url text`
- `author_hash varchar(128)`
- `sanitized_excerpt text`
- `occurred_at timestamptz`
- `metadata jsonb`
- `created_at timestamptz`

## Estructura De Archivos

Backend:

```text
backend/app/api/v1/tlachia.py
backend/app/schemas/tlachia.py
backend/app/services/tlachia/__init__.py
backend/app/services/tlachia/synthetic_adapters.py
backend/app/services/tlachia/synthetic_ingestion_service.py
backend/app/services/tlachia/normalization.py
backend/app/services/tlachia/sanitization.py
backend/app/services/tlachia/risk_rules.py
backend/app/services/tlachia/alert_service.py
backend/tests/test_tlachia_*.py
```

Frontend:

```text
frontend/apps/demo/src/lib/tlachia-api.ts
frontend/apps/demo/src/app/app/tlachia/page.tsx
frontend/apps/demo/src/app/app/tlachia/alerts/[id]/page.tsx
```

Docs:

```text
docs/technical/tlachia-synthetic-api-path.md
docs/technical/api-contracts.md
docs/technical/data-model.md
docs/product/module-interaction-flow.md
backend/modules/tlachia/README.md
```

## Endpoints MVP

```text
GET  /api/v1/tlachia/sources
POST /api/v1/tlachia/sources
GET  /api/v1/tlachia/sources/{source_id}
PATCH /api/v1/tlachia/sources/{source_id}
POST /api/v1/tlachia/sources/{source_id}/pause
POST /api/v1/tlachia/sources/{source_id}/resume

POST /api/v1/tlachia/ingest/synthetic
GET  /api/v1/tlachia/ingestion-runs
GET  /api/v1/tlachia/ingestion-runs/{run_id}

GET  /api/v1/tlachia/alerts
GET  /api/v1/tlachia/alerts/{alert_id}
POST /api/v1/tlachia/alerts/{alert_id}/review
POST /api/v1/tlachia/alerts/{alert_id}/dismiss
POST /api/v1/tlachia/alerts/{alert_id}/escalate
```

## Reglas Iniciales De Riesgo

Empezar con reglas simples:

- mention match;
- lenguaje potencialmente basado en genero desde glosario controlado;
- rafaga temporal;
- similitud de plantillas;
- engagement sintetico alto;
- plataforma/escenario marcado como riesgo demo.

Niveles:

- `unclassified`: insuficiente o no evaluado.
- `low`: 1-34.
- `medium`: 35-69.
- `high`: 70-100.

Nunca usar `confirmed`.

## Fases

### Fase 0: Alinear Documentacion

Tareas:

- Quitar referencias a API real de Reddit/YouTube para Tlachia.
- Documentar `docs/technical/tlachia-synthetic-api-path.md`.
- Actualizar README, module-interaction-flow, propuesta v3, deployment, data-model y api-contracts.

Verificacion:

```bash
rg -n "REDDIT_CLIENT|REDDIT_SECRET|YOUTUBE_API_KEY|PRAW|ingest/reddit|Reddit API oficial" README.md docs backend/modules .env.example
git diff --check
```

Commit y push:

```bash
git add README.md docs backend/modules plans .env.example
git commit -m "docs(tlachia): switch mvp to synthetic platform adapters"
git push
```

No continuar a Fase 1 hasta que este commit este en remoto.

### Fase 1: Login, Logout Y Auditoria

Tareas:

- Asegurar `POST /api/v1/auth/logout`.
- Asegurar `POST /api/v1/auth/change-password`.
- Auditar login, logout y cambio de password.
- Mantener `JWT_SECRET` obligatorio en produccion.

Verificacion:

```bash
cd backend
DATABASE_URL=postgresql://... pytest -q tests/test_auth*.py
cd ..
git diff --check
```

Commit y push:

```bash
git add backend/app backend/tests docs/technical/api-contracts.md
git commit -m "feat(auth): add session logout and password management"
git push
```

### Fase 2: Usuarios Y RBAC

Tareas:

- Implementar/validar endpoints `/api/v1/users`.
- Crear rol `admin`.
- Proteger endpoints con `require_roles("admin")`.
- Auditar cambios de usuario y roles.

Verificacion:

```bash
cd backend
DATABASE_URL=postgresql://... pytest -q tests/test_users*.py tests/test_auth*.py
cd ..
git diff --check
```

Commit y push:

```bash
git add backend/app backend/tests docs/technical/api-contracts.md docs/technical/data-model.md
git commit -m "feat(iam): add user administration and role controls"
git push
```

### Fase 3: Fixtures Sinteticos

Tareas:

- Crear `datasets/synthetic/tlachia`.
- Crear fixtures para Facebook, Instagram, X, TikTok y Reddit.
- Crear README del dataset sintetico.
- Incluir escenarios:
  - debate organico intenso;
  - rafaga coordinada con estereotipos;
  - caso ambiguo con datos insuficientes.

Verificacion:

```bash
rg -n "contains_real_personal_data.*true|@|telefono|email" datasets/synthetic/tlachia
git diff --check
```

Commit y push:

```bash
git add datasets/synthetic/tlachia
git commit -m "data(tlachia): add synthetic platform fixtures"
git push
```

### Fase 4: Migracion Tlachia Sintetica

Tareas:

- Crear migracion para `tlachia.sources`, `tlachia.ingestion_runs`, `tlachia.platform_items` si no existen.
- Agregar modelos SQLAlchemy.
- Actualizar `docs/technical/data-model.md`.

Verificacion:

```bash
cd backend
DATABASE_URL=postgresql://... pytest -q tests/test_migrations*.py
cd ..
git diff --check
```

Commit y push:

```bash
git add backend/app/db/models.py backend/migrations backend/tests docs/technical/data-model.md
git commit -m "feat(tlachia): add synthetic source ingestion tables"
git push
```

### Fase 5: Adaptadores Sinteticos

Tareas:

- Implementar `synthetic_adapters.py`.
- Implementar adaptadores:
  - Facebook;
  - Instagram;
  - X;
  - TikTok;
  - Reddit.
- Validar estructura de fixtures.
- Normalizar a contrato comun.

Verificacion:

```bash
cd backend
pytest -q tests/test_tlachia_synthetic_adapters.py
cd ..
git diff --check
```

Commit y push:

```bash
git add backend/app/services/tlachia backend/tests
git commit -m "feat(tlachia): add synthetic platform adapters"
git push
```

### Fase 6: Sanitizacion Y Reglas

Tareas:

- Implementar `sanitization.py`.
- Implementar `risk_rules.py`.
- Asegurar que la persistencia guarde extractos y metadatos minimos.
- Agregar glosario demo controlado.

Verificacion:

```bash
cd backend
pytest -q tests/test_tlachia_sanitization.py tests/test_tlachia_risk_rules.py
cd ..
rg -n "confirmed|VPMRG_CONFIRMED" backend/app backend/tests
git diff --check
```

Commit y push:

```bash
git add backend/app/services/tlachia backend/tests docs/technical/api-contracts.md
git commit -m "feat(tlachia): add synthetic risk rules and sanitization"
git push
```

### Fase 7: Ingesta Sintetica Y Alertas

Tareas:

- Implementar `synthetic_ingestion_service.py`.
- Registrar `ingestion_runs`.
- Insertar `platform_items`.
- Crear alertas y `alert_signals`.
- Auditar ejecucion.

Verificacion:

```bash
cd backend
pytest -q tests/test_tlachia_synthetic_ingestion.py tests/test_tlachia_alert_service.py
cd ..
git diff --check
```

Commit y push:

```bash
git add backend/app/services/tlachia backend/tests
git commit -m "feat(tlachia): ingest synthetic fixtures into explainable alerts"
git push
```

### Fase 8: API Tlachia

Tareas:

- Crear/ajustar schemas.
- Crear endpoints Tlachia.
- Proteger con roles.
- Auditar revision, descarte y escalamiento.

Verificacion:

```bash
cd backend
pytest -q tests/test_tlachia_api.py tests/test_auth*.py
cd ..
git diff --check
```

Commit y push:

```bash
git add backend/app/api backend/app/schemas backend/tests docs/technical/api-contracts.md
git commit -m "feat(tlachia): expose synthetic ingestion and alert review api"
git push
```

### Fase 9: Dashboard Tlachia

Tareas:

- Crear `tlachia-api.ts`.
- Conectar lista y detalle de alertas.
- Conectar ingesta sintetica.
- Conectar acciones de revision.
- Mostrar plataforma, escenario, senales y estado.

Verificacion:

```bash
npm run lint
npm run typecheck
cd backend
pytest -q tests/test_tlachia_api.py
cd ..
git diff --check
```

Commit y push:

```bash
git add frontend/apps/demo/src backend/app docs/technical/api-contracts.md
git commit -m "feat(tlachia): connect dashboard to synthetic alert api"
git push
```

### Fase 10: Runner Controlado

Tareas:

- Crear `python -m app.services.tlachia.run_synthetic_ingestion`.
- Permitir `--scenario` y `--platform`.
- Respetar `TLACHIA_INGESTION_ENABLED`.

Verificacion:

```bash
cd backend
python -m app.services.tlachia.run_synthetic_ingestion --help
pytest -q tests/test_tlachia_synthetic_ingestion.py
cd ..
git diff --check
```

Commit y push:

```bash
git add backend/app/services/tlachia docs/technical/deployment.md
git commit -m "feat(tlachia): add controlled synthetic ingestion runner"
git push
```

### Fase 11: Cierre Documental

Tareas:

- Actualizar `backend/modules/tlachia/README.md`.
- Actualizar `docs/technical/tlachia-synthetic-api-path.md`.
- Actualizar `docs/technical/api-contracts.md`.
- Actualizar `docs/technical/deployment.md`.
- Confirmar que no quedan promesas de API real en MVP.

Verificacion:

```bash
rg -n "REDDIT_CLIENT|REDDIT_SECRET|YOUTUBE_API_KEY|PRAW|ingest/reddit|OAuth directo" README.md docs backend/modules .env.example
git diff --check
```

Commit y push:

```bash
git add docs backend/modules README.md plans .env.example
git commit -m "docs(tlachia): finalize synthetic adapter mvp documentation"
git push
```

## Criterios De Aceptacion Final

- No hay API keys reales para Tlachia.
- La ingesta funciona sin internet.
- Hay fixtures de Facebook, Instagram, X, TikTok y Reddit.
- Las pruebas son deterministas.
- El dashboard muestra alertas sinteticas con senales explicables.
- Todas las alertas requieren revision humana.
- Ningun resultado automatico usa `confirmed`.
- La documentacion declara que el MVP no monitorea plataformas reales.

## Checklist De Commits

- [ ] Fase 0 commit/push: `docs(tlachia): switch mvp to synthetic platform adapters`
- [ ] Fase 1 commit/push: `feat(auth): add session logout and password management`
- [ ] Fase 2 commit/push: `feat(iam): add user administration and role controls`
- [ ] Fase 3 commit/push: `data(tlachia): add synthetic platform fixtures`
- [ ] Fase 4 commit/push: `feat(tlachia): add synthetic source ingestion tables`
- [ ] Fase 5 commit/push: `feat(tlachia): add synthetic platform adapters`
- [ ] Fase 6 commit/push: `feat(tlachia): add synthetic risk rules and sanitization`
- [ ] Fase 7 commit/push: `feat(tlachia): ingest synthetic fixtures into explainable alerts`
- [ ] Fase 8 commit/push: `feat(tlachia): expose synthetic ingestion and alert review api`
- [ ] Fase 9 commit/push: `feat(tlachia): connect dashboard to synthetic alert api`
- [ ] Fase 10 commit/push: `feat(tlachia): add controlled synthetic ingestion runner`
- [ ] Fase 11 commit/push: `docs(tlachia): finalize synthetic adapter mvp documentation`
