#!/bin/sh
set -e

echo "Running Alembic database migrations..."
# EasyPanel may start the app before PostgreSQL accepts connections: retry for up to ~60s.
tries=0
until alembic upgrade head; do
  tries=$((tries + 1))
  if [ "$tries" -ge 20 ]; then
    echo "Database migrations failed after $tries attempts." >&2
    exit 1
  fi
  echo "Database not ready yet (attempt $tries/20) - retrying in 3s..."
  sleep 3
done

echo "Starting Kinédoux FastAPI Server..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips="*"
