# Deploy NestJS backend to Vercel

## Goal

Ship a Vercel **preview** deployment of `apps/backend` under team `clawd-cook`, so the NestJS API has a public preview URL. Durable room storage and production deploys are out of scope.

## Background

- npm workspaces monorepo; backend depends on `@lejv-party/domain`, `@lejv-party/validation`, `@lejv-party/game-data`.
- Entry `apps/backend/src/main.ts` already uses `app.listen(process.env.PORT ?? 3000)` and matches [Vercel NestJS entrypoint detection](https://vercel.com/docs/frameworks/backend/nestjs).
- Global prefix `api`; CORS on. Health-style route: `GET /api` → `Hello World!`.
- Rooms are in-memory; realtime is SSE. `AI_*` is read only in `translator.service` (not required to boot).
- Git remote `git@github.com:clawd-cook/lejv-party.git`. CLI user `heyq02`, team `clawd-cook`. Not linked yet. No `vercel.json` yet.

## Requirements

1. Link or create a Vercel project under `clawd-cook` that deploys the Nest backend (Root Directory effectively `apps/backend`, with monorepo install/build).
2. Preview deploy succeeds and returns a public URL (CLI `vercel deploy` preferred for first ship; no production).
3. `GET /api` on that URL returns success (not a boot/framework error).
4. Do not commit secrets; do not configure `AI_*` on Vercel in this task.
5. Document accepted serverless limits (ephemeral memory, SSE / multi-instance) in task notes or design.

## Decisions

- Accept in-memory + SSE limits for MVP.
- Defer `AI_*` env on Vercel; AI features may fail until configured later.

## Out of scope

- Production deploy / custom domain
- Redis/KV or other durable room store
- Deploying `frontend-web` / `frontend-app`
- Changing Node pin (local remains nvm `24.20.0`)
- Configuring `AI_*` on Vercel

## Acceptance Criteria

- [ ] Vercel project linked under `clawd-cook` for backend (`.vercel/` present; gitignored if local-only).
- [ ] Preview deploy succeeds with a public URL.
- [ ] `GET {preview}/api` returns a successful Hello World-style response.
- [ ] Workspace packages resolve in the Vercel build (no missing `@lejv-party/*` module errors).
- [ ] `AI_*` left unset on Vercel; gap noted.
- [ ] Serverless limits called out in design/task notes.

## Open questions

None blocking.
