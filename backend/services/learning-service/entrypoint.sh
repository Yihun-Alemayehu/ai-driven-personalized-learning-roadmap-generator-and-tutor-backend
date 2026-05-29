#!/bin/sh
set -e

echo "Syncing database schema..."
node node_modules/.bin/prisma db push --accept-data-loss --skip-generate
echo "Running database seeds..."
node dist/prisma/seed.js
echo "Seeds complete. Starting server..."
exec "$@"
