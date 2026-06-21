#!/bin/sh
set -e

# Ensure the volume-mounted data dir exists, then initialize the SQLite DB on
# first run (seed) or just apply schema on subsequent runs (preserving data).
mkdir -p /data

if [ ! -f /data/app.db ]; then
  echo "[entrypoint] No database found — creating schema and seeding..."
  node_modules/.bin/prisma db push --skip-generate
  node_modules/.bin/tsx prisma/seed.ts
else
  echo "[entrypoint] Existing database found — ensuring schema is current..."
  node_modules/.bin/prisma db push --skip-generate
fi

exec "$@"
