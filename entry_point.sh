#!/bin/sh
set -e

echo "[entrypoint] building app..."
npm run build

echo "[entrypoint] starting app..."
exec npm run start -- --hostname 0.0.0.0 --port 3000
