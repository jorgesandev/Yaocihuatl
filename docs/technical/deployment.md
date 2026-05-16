# Despliegue

Yaocihuatl esta desplegada como aplicacion Dockerizada en AWS EC2 Ubuntu bajo el dominio `yaocihuatl.com`. Este documento describe el estado operativo actual y los criterios minimos para mantener el despliegue alineado con privacidad, auditabilidad y separacion de ambientes.

## Topologia Actual

```text
Internet
  |
  v
yaocihuatl.com
  |
  v
Reverse proxy / TLS en EC2
  |
  +--> 127.0.0.1:3000  frontend Next.js
  +--> 127.0.0.1:8000  backend FastAPI

Docker network yaocihuatl-net
  |
  +--> postgres:5432  pgvector/pgvector:pg17
  +--> redis:6379     redis:7-alpine
```

`docker-compose.prod.yml` publica frontend y backend solo en loopback. PostgreSQL y Redis no se exponen publicamente en produccion.

## Servicios

| Servicio | Imagen/build | Funcion | Persistencia |
|---|---|---|---|
| `frontend` | `frontend/apps/demo/Dockerfile` | App Next.js principal. | Sin volumen persistente. |
| `backend` | `backend/Dockerfile` | API FastAPI, auth, Chimalli, migraciones/seed segun env. | `backend-evidence-storage` para evidencia demo/local. |
| `postgres` | `pgvector/pgvector:pg17` | Base principal con extensiones `pgcrypto` y `vector`. | `postgres-data`. |
| `redis` | `redis:7-alpine` | Cache/infra futura para colas o sesiones auxiliares. | `redis-data`. |

## Variables Requeridas En Produccion

Estas variables deben vivir en `.env` del servidor y nunca en git:

```bash
APP_ENV=production
FRONTEND_URL=https://yaocihuatl.com
FRONTEND_URLS=https://yaocihuatl.com
NEXT_PUBLIC_API_URL=https://yaocihuatl.com

POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_DB=...
REDIS_PASSWORD=...
JWT_SECRET=...

RUN_MIGRATIONS_ON_START=true
SEED_DEMO_DATA=false
CHIMALLI_DEMO_MODE=true
```

Si se habilita LLM externo:

```bash
LLM_PROVIDER=deepseek
LLM_MODEL=deepseek-chat
LLM_BASE_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=...
```

o:

```bash
LLM_PROVIDER=openrouter
LLM_MODEL=deepseek/deepseek-chat
LLM_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_API_KEY=...
OPENROUTER_HTTP_REFERER=https://yaocihuatl.com
OPENROUTER_APP_TITLE=Yaocihuatl Chimalli
```

No enviar datos sensibles a un proveedor LLM externo sin documentacion institucional, base legal, minimizacion y autorizacion.

Si se habilita Tlachia con Reddit (MVP):

```bash
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USERNAME=...
REDDIT_PASSWORD=...
REDDIT_USER_AGENT=python:yaocihuatl-tlachia:v0.1.0 (by /u/institutional_account)
REDDIT_REQUEST_TIMEOUT_SECONDS=20
REDDIT_MAX_REQUESTS_PER_RUN=50
REDDIT_DEFAULT_LOOKBACK_HOURS=24

TLACHIA_INGESTION_ENABLED=false
TLACHIA_DEMO_MODE=true
TLACHIA_STORE_RAW_REDDIT_CONTENT=false
TLACHIA_RETENTION_HOURS=48
TLACHIA_MIN_ALERT_SCORE=50
```

Notas Reddit:

- `REDDIT_USER_AGENT` debe ser unico, descriptivo y verdadero.
- `TLACHIA_STORE_RAW_REDDIT_CONTENT=false` es el default; solo se guardan extractos sanitizados y metadatos minimos.
- `TLACHIA_RETENTION_HOURS=48` minimiza retencion de contenido de Reddit segun recomendacion operativa.
- Respetar headers de rate limit: `X-Ratelimit-Used`, `X-Ratelimit-Remaining`, `X-Ratelimit-Reset`.
- Si contenido o cuentas se eliminan en Reddit, debe eliminarse el contenido relacionado localmente.

## Comandos Operativos

Primer despliegue:

```bash
git clone git@github.com:LexHackersClub/Yaocihuatl.git /opt/yaocihuatl
cd /opt/yaocihuatl
cp .env.example .env
# editar .env con secretos reales
docker compose -f docker-compose.prod.yml up -d --build
```

Actualizar:

```bash
cd /opt/yaocihuatl
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Estado:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 backend
docker compose -f docker-compose.prod.yml logs --tail=100 frontend
```

Migraciones:

```bash
docker compose -f docker-compose.prod.yml exec backend alembic current
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

Healthchecks:

```bash
curl -f http://127.0.0.1:8000/health
curl -f http://127.0.0.1:3000
```

## Datos Demo vs Datos Reales

Mientras el despliegue use datos sinteticos, puede mantenerse el badge demo y credenciales de prueba controladas. Antes de cualquier dato real o autorizado institucionalmente:

- `SEED_DEMO_DATA` debe estar en `false`;
- deben eliminarse credenciales publicas;
- debe existir RBAC por rol y recurso;
- debe configurarse retencion;
- debe existir procedimiento de borrado y exportacion;
- debe habilitarse cifrado de evidencia en reposo;
- debe documentarse el responsable institucional del tratamiento de datos.

## Backups

Pendiente de formalizar antes de produccion con datos reales:

- respaldo cifrado de PostgreSQL;
- respaldo de volumen de evidencia;
- prueba de restauracion;
- retencion de backups;
- control de acceso a respaldos;
- bitacora de restauraciones.

## Ejecucion Programada Controlada (Opcion MVP)

Para ejecutar ingesta periodica sin Celery, usar cron del servidor con restricciones:

```bash
# Ejecutar cada hora solo si TLACHIA_INGESTION_ENABLED=true
0 * * * * cd /opt/yaocihuatl/backend && python -m app.services.tlachia.run_reddit_ingestion --source-id <UUID> >> /var/log/yaocihuatl-ingestion.log 2>&1
```

Reglas:

- Configurar `TLACHIA_INGESTION_ENABLED=true` explicitamente antes de habilitar cron.
- Monitorear `/var/log/yaocihuatl-ingestion.log` para detectar rate limits o errores.
- Nunca ejecutar mas frecuente que el intervalo de rate limit de Reddit (100 queries/minuto promediado).
- Usar un usuario de sistema sin privilegios para ejecutar el comando.
- Rotar logs para evitar llenado de disco.

## Hardening Pendiente

- Firewall con solo HTTP/HTTPS/SSH administrativo permitido.
- TLS renovable automaticamente.
- SSH con llaves, sin password, usuarios limitados.
- Rotacion de `JWT_SECRET`, DB y Redis.
- Logs sin evidencia ni datos personales.
- Monitoreo de disco, memoria, CPU y healthchecks.
- Alertas por caida de contenedores.
- Procedimiento de respuesta ante incidente.
