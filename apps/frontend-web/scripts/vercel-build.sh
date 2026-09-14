#!/usr/bin/env bash
set -euo pipefail

# Resolve monorepo root from this script so the command works whether Vercel
# runs it from apps/frontend-web or a developer runs it from repo root.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# scripts/ → frontend-web/ → apps/ → repo root
ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/package.json" || ! -d "$ROOT/packages/domain" ]]; then
  echo "vercel-build.sh: expected monorepo root at $ROOT" >&2
  exit 1
fi

# Shared packages the Vue app imports at build time.
npm run build -w @lejv-party/domain
npm run build -w @lejv-party/validation
npm run build -w @lejv-party/client-core
npm run build -w @lejv-party/api-client
npm run build -w frontend-web
