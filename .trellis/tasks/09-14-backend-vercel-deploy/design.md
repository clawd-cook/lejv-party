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

`apps/backend/vercel.json`:

- `installCommand`: `cd ../.. && npm install` (lockfile at root).
- `buildCommand`: `bash scripts/vercel-build.sh` — builds domain → validation → backend, then **copies** those packages (plus JSON `game-data`) into `apps/backend/node_modules/@lejv-party/*` so the Nest function can resolve them at runtime (workspace symlinks / `packages/` alone are not enough). Each copy drops that package’s own `node_modules` (dev tooling); runtime deps resolve from `apps/backend/node_modules`.
- Leave Nest entry detection to Vercel; avoid obsolete `builds`/`routes` v2 unless needed as fallback.
- Entry: `src/main.ts` must call `void bootstrap()` (not top-level `await bootstrap()`); Vercel patches `Server#listen` and only binds after the module finishes evaluating.

Local Node remains 24.20.0; project Node set to **24.x**.

## Runtime / ops notes

- Nest runs as **one** Vercel Function (Fluid). In-memory rooms and SSE subscriptions do not survive cold starts or scale-out; accepted for MVP.
- Without `AI_*`, translator paths fail; boot and non-AI routes still work. Nest Observe stays off unless `NEST_OBSERVE_APP_KEY` / `NEST_OBSERVE_APP_SECRET` are set.
- SSO deployment protection was disabled on this preview project so `GET /api` is publicly reachable.
- Smoke `GET /api` once for acceptance (in-task exception to the deploy skill’s no-curl default).

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
