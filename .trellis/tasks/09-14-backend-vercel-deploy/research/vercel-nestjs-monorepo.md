# Research: NestJS on Vercel + this monorepo

## NestJS on Vercel (official)

- Docs: https://vercel.com/docs/frameworks/backend/nestjs
- Zero-config: recognized entry includes `src/main.ts` with `app.listen(process.env.PORT ?? 3000)`.
- App becomes a single Vercel Function (Fluid compute).
- Min CLI noted in docs: 48.4.0+ (local CLI is newer).

## This repo

- `apps/backend/src/main.ts` already matches the entry pattern.
- Workspace deps: `@lejv-party/domain`, `@lejv-party/validation` (need `tsc` build), `@lejv-party/game-data` (JSON only).
- Global prefix `api` → smoke path `GET /api`.
- No existing `vercel.json`; `.vercel` not in gitignore yet (should add).

## Implication

Prefer Root Directory `apps/backend` + root-level `npm install` and package builds over a custom `api/` serverless wrapper. Fallback to ExpressAdapter handler only if Nest detection fails.
