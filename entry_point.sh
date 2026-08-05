#!/bin/sh
set -e

echo "[entrypoint] starting app..."
exec node server.js
