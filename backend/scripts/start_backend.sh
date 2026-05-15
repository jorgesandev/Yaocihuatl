set -eu

if [ "${RUN_MIGRATIONS_ON_START:-true}" = "true" ]; then
  alembic upgrade head
fi

if [ "${SEED_DEMO_DATA:-true}" = "true" ] && [ "${APP_ENV:-development}" != "production" ]; then
  python -m app.seed.demo_data
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
