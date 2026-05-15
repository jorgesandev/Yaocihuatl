# Docker

Servicios de infraestructura para desarrollo local.

## Servicios

| Servicio | Imagen | Puerto | Propósito |
|---|---|---|---|
| postgres | `pgvector/pgvector:pg17` | 5432 | Base de datos con extensión pgvector |
| redis | `redis:7-alpine` | 6379 | Broker/cache para Celery |

## Inicio rápido

```bash
cp .env.example .env
# Editar .env con valores seguros para producción
docker compose up -d
```

## Verificar salud de los servicios

```bash
docker compose ps
docker compose logs -f
```

## Conexión a servicios

| Servicio | URL local | Credenciales (default) |
|---|---|---|
| PostgreSQL | `localhost:5432` | `yaocihuatl` / `change-me-in-production` |
| Redis | `localhost:6379` | sin contraseña (dev) |

## Detener servicios

```bash
docker compose down
# Eliminar volúmenes (pierde todos los datos)
docker compose down -v
```

## Seguridad

- Nunca usar credenciales default en producción.
- `.env` está en `.gitignore` y no debe versionarse.
- Ver [SECURITY.md](../../SECURITY.md) para política completa.