#!/usr/bin/env bash
# Promote a Vercel deployment to production; treat "already current production" (409) as success.
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: vercel-promote-idempotent.sh <deployment-url-or-id> [extra vercel args...]" >&2
  exit 1
fi

DEPLOYMENT="$1"
shift

SCOPE="${VERCEL_SCOPE:-clawd-cook}"
TIMEOUT="${VERCEL_PROMOTE_TIMEOUT:-5m}"

echo "Promoting ${DEPLOYMENT} (scope=${SCOPE})"

set +e
OUTPUT="$(vercel promote "${DEPLOYMENT}" --yes --scope "${SCOPE}" --timeout "${TIMEOUT}" "$@" 2>&1)"
STATUS=$?
set -e

printf '%s\n' "${OUTPUT}"

if [ "${STATUS}" -eq 0 ]; then
  exit 0
fi

# Idempotent: already the live production deployment.
if printf '%s\n' "${OUTPUT}" | grep -Eqi \
  'already the current production deployment|[[:space:]]\(409\)|status code 409|HTTP 409'; then
  echo "::notice::Deployment is already production; continuing."
  exit 0
fi

exit "${STATUS}"
