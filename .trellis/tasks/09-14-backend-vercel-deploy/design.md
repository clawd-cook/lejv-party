# Design: backend → Vercel preview

## Approach

Use Vercel’s **native NestJS** support (Fluid Function, keep `src/main.ts` + `listen`). Do **not** add a custom `api/index.ts` handler unless zero-config fails in this monorepo.

Monorepo is the real work: Vercel Root Directory = `apps/backend`, but install/build must run from the **repo root** so workspace packages resolve.

## Boundaries

| In | Out |
| --- | --- |
| `apps/backend/vercel.json` (install/build/output hints) | Frontend apps |
| `.gitignore` entry for `.vercel/` | Production / custom domain |
| Link under `--scope clawd-cook` | `AI_*` env upload |
| CLI preview deploy (`vercel deploy -y --no-wait`) | Redis/KV room store |
| Smoke: `GET /api` | Changing Nest module layout |

## Project linking

1. Prefer creating/linking a dedicated backend project with Root Directory `apps/backend` and team `clawd-cook`.
2. Skill default `vercel link --repo` is OK if it can map this directory; if the interactive/repo flow cannot set Root Directory correctly, fall back to linking from `apps/backend` with `--scope clawd-cook`.
3. First deploy via **CLI**, not git push (ask before any push). Git-connected auto-deploy can come after config is committed and user approves push.
4. **CLI must run from the monorepo root** (not `apps/backend`). Subdir-only uploads make `cd ../..` land on `/` and fail with `Tracker "idealTree" already exists`. Prefer `vercel deploy --force --archive=tgz` when a prior broken file set may be cached.

## Build / install contract

Proposed `apps/backend/vercel.json` (exact flags may be adjusted during implement if CLI/UI requires project settings instead):

- `installCommand`: from backend dir, `cd ../.. && npm install` (lockfile at root).
- `buildCommand`: from root, build `@lejv-party/domain`, `@lejv-party/validation`, then `backend` (`game-data` is JSON-only, no build).
- Leave Nest entry detection to Vercel; avoid obsolete `builds`/`routes` v2 unless needed as fallback.

Local Node remains 24.20.0; Vercel’s build image Node is whatever the project setting allows—prefer Node 24.x on the project if configurable.

## Runtime / ops notes

- Nest runs as **one** Vercel Function (Fluid). In-memory rooms and SSE subscriptions do not survive cold starts or scale-out; accepted for MVP.
- Without `AI_*`, translator paths fail; boot and non-AI routes still work.
- Do not curl-verify beyond returning the preview URL per deploy skill; smoke `GET /api` once for acceptance is in-task exception to confirm boot (optional CLI `curl` after deploy ready).

## Rollback

- Remove or revert `apps/backend/vercel.json` and `.gitignore` changes.
- Unlink / delete the Vercel project in dashboard if the preview project should not remain.
- No DB migrations involved.

## Trade-offs

| Choice | Why | Cost |
| --- | --- | --- |
| Zero-config Nest entry | Matches current Vercel docs; less code | Less control than custom serverless wrapper |
| Root Directory `apps/backend` + root install | Correct workspace resolution | Custom install/build commands to maintain |
| CLI preview first | No push required; faster feedback | Git auto-deploy not enabled until later |
| Skip `AI_*` | Faster, no secret handling this turn | AI routes broken on preview until env added |
