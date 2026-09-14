# Wire production backend URL

## Goal

Point both frontend clients at the production Nest API origin `https://www.lejv-party-backend.casa` so room/party traffic leaves localhost defaults.

## Background

- Production origin: `https://www.lejv-party-backend.casa`
- Smoke (2026-09-14): `GET …/api` → `200` + `Hello World!` (CORS `*`)
- `packages/api-client` joins `{baseUrl}` + paths that already include `/api/...` — base must be **origin only**
- frontend-web: `VITE_API_BASE_URL` in `apps/frontend-web/src/main.ts`; Pages workflow requires `vars.VITE_API_BASE_URL`; Vite dev proxy `/api` → `localhost:3000`
- frontend-app: `apps/frontend-app/src/lib/api.ts` — globalProps `apiBaseUrl` / `api_base_url`, else `DEFAULT_BASE_URL`

## Decisions

| Topic | Choice |
|-------|--------|
| frontend-app default | `DEFAULT_BASE_URL` → production origin; globalProps still overrides for LAN/local |
| frontend-web bake | Both: commit `apps/frontend-web/.env.production` **and** set GitHub `vars.VITE_API_BASE_URL` |

## Requirements

- **R1**: Commit `apps/frontend-web/.env.production` with `VITE_API_BASE_URL=https://www.lejv-party-backend.casa`
- **R2**: Set GitHub repository variable `VITE_API_BASE_URL` to the same origin (Pages CI)
- **R3**: Change frontend-app `DEFAULT_BASE_URL` to `https://www.lejv-party-backend.casa`
- **R4**: Update `.trellis/spec/guides/room-party-api-contract.md` (and briefly `vercel-deploy.md` production origin note) so clients and prod domain stay discoverable

## Acceptance Criteria

- [x] AC1: `apps/frontend-web/.env.production` exists with production origin (no `/api` suffix)
- [x] AC2: GitHub `vars.VITE_API_BASE_URL` equals that origin (or documented manual step if CLI unavailable) — check: real `gh` unavailable; exact UI/CLI steps in `implement.md`
- [x] AC3: `apps/frontend-app/src/lib/api.ts` default (no override) is the production origin
- [x] AC4: Specs describe production origin + web env / app default / override paths; Vite proxy remains localhost for `npm run dev`
- [x] AC5: `GET https://www.lejv-party-backend.casa/api` still returns `200` Hello World

## Out of Scope

- Nest/Vercel redeploy or domain DNS changes
- Redis / durable rooms / SSE multi-instance
- `AI_*` secrets
- Changing Vite proxy target
- Mandatory Pages redeploy in-repo (may be triggered after var set; not a code AC)

## Notes

- Public production origin is not a secret; safe to commit in `.env.production`
- Prefer GitHub CLI (`gh variable set`) when the real CLI is on PATH; nvm’s npm package named `gh` is **not** GitHub CLI
