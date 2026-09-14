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
# Drop each package's own node_modules (dev tooling / workspace links) — runtime
# deps such as zod resolve from apps/backend/node_modules after root install.
mkdir -p "$BACKEND/node_modules/@lejv-party"
materialize_pkg() {
  local name="$1"
  local src="$ROOT/packages/$name"
  local dest="$BACKEND/node_modules/@lejv-party/$name"
  rm -rf "$dest"
  cp -R "$src" "$dest"
  rm -rf "$dest/node_modules"
}
materialize_pkg domain
materialize_pkg validation
materialize_pkg game-data
