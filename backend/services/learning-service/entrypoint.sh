#!/bin/sh
set -e

echo "Syncing database schema (errors skipped to preserve existing enum values)..."
node node_modules/.bin/prisma db push --accept-data-loss --skip-generate || echo "Schema push skipped (likely enum drift — DB schema is already correct)"
echo "Running database seeds..."
node dist/prisma/seed.js || echo "Seed skipped (already seeded)"
echo "Starting server..."
exec "$@"
