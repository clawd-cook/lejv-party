#!/usr/bin/env bash
set -euo pipefail

# Resolve monorepo root from this script's location so the command works
# whether Vercel runs it from apps/backend or a developer runs it from repo root.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# scripts/ → backend/ → apps/ → repo root
ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
BACKEND="$ROOT/apps/backend"
cd "$ROOT"

if [[ ! -f "$ROOT/package.json" || ! -d "$ROOT/packages/domain" ]]; then
  echo "vercel-build.sh: expected monorepo root at $ROOT" >&2
  exit 1
fi

npm run build -w @lejv-party/domain
npm run build -w @lejv-party/validation
npm run build -w backend

# Materialize workspace packages next to the Nest app so Node can resolve
# `@lejv-party/*` from apps/backend/src without relying on broken workspace
# symlink rewriting inside the Vercel function bundle.
mkdir -p "$BACKEND/node_modules/@lejv-party"
rm -rf \
  "$BACKEND/node_modules/@lejv-party/domain" \
  "$BACKEND/node_modules/@lejv-party/validation" \
  "$BACKEND/node_modules/@lejv-party/game-data"
cp -R "$ROOT/packages/domain" "$BACKEND/node_modules/@lejv-party/domain"
cp -R "$ROOT/packages/validation" "$BACKEND/node_modules/@lejv-party/validation"
cp -R "$ROOT/packages/game-data" "$BACKEND/node_modules/@lejv-party/game-data"
