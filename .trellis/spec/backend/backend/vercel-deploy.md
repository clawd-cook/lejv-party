# Vercel Preview Deploy (NestJS Backend)

Executable contract for deploying `apps/backend` to Vercel under team `clawd-cook`.

---

## Scenario: NestJS monorepo → Vercel Fluid Function

### 1. Scope / Trigger

- Trigger: linking, configuring, or changing how `apps/backend` builds/runs on Vercel (preview or later production).
- Touches: `apps/backend/vercel.json`, `apps/backend/scripts/vercel-build.sh`, `apps/backend/src/main.ts`, root `.vercelignore` / `.gitignore` (`.vercel`).
- Out of scope here: Redis/KV durable rooms, production custom domain, uploading `AI_*` secrets unless a later task owns that.

### 2. Signatures

| Piece | Contract |
|-------|----------|
| Vercel Root Directory | `apps/backend` |
| Project (preview) | `clawd-cook/lejv-party-backend`, Node `24.x`, framework `nestjs` |
| Install | `cd ../.. && npm install` (root lockfile) |
| Build | `bash scripts/vercel-build.sh` → build `@lejv-party/domain` → `@lejv-party/validation` → `backend`, then materialize packages |
| Entry | `src/main.ts` — `void bootstrap()` (not top-level `await`) |
| Listen | `app.listen(process.env.PORT ?? 3000)` with global prefix `api` |
| Smoke | `GET /api` → `200` body `Hello World!` |
| CLI deploy cwd | **Monorepo root** (not `apps/backend`) |

### 3. Contracts

**Build / install**

- Workspace packages required at runtime: `@lejv-party/domain`, `@lejv-party/validation`, `@lejv-party/game-data`.
- After Nest build, `vercel-build.sh` copies those package trees into `apps/backend/node_modules/@lejv-party/*` and drops each copy’s own `node_modules` (runtime deps resolve from `apps/backend/node_modules`).
- Do not rely on workspace symlinks alone inside the Vercel function bundle.

**Environment**

| Key | Required for boot | Notes |
|-----|-------------------|-------|
| `PORT` | No (Vercel injects) | Local default `3000` |
| `AI_*` | No | Translator paths fail until set |
| `NEST_OBSERVE_APP_KEY` / `NEST_OBSERVE_APP_SECRET` | No | Observe stays off if unset |

**Runtime limits (accepted MVP)**

- One Fluid Function; in-memory rooms and SSE do **not** survive cold starts or multi-instance scale-out.
- Preview SSO protection may need disabling for public `GET /api` smoke checks.

### 4. Validation & Error Matrix

| Condition | Failure mode |
|-----------|--------------|
| Deploy CLI from `apps/backend` only | `cd ../..` lands on `/`; npm tracker errors (`idealTree` already exists) |
| Skip package materialize | Runtime `Cannot find module '@lejv-party/...'` in function |
| Top-level `await bootstrap()` | Entry module hangs; listen patch never binds |
| Wrong Root Directory | Nest not detected / wrong install cwd |
| Stale broken file cache after bad upload | Prefer `vercel deploy --force --archive=tgz` from repo root |

### 5. Good / Base / Bad Cases

- **Good**: Root Directory `apps/backend`; `vercel.json` install/build as above; `void bootstrap()`; CLI `vercel deploy` from repo root; smoke `GET /api` → Hello World.
- **Base**: Preview only; `AI_*` unset; rooms in-memory / SSE ephemeral.
- **Bad**: Subdir-only upload; symlink-only workspace resolution; `await bootstrap()` at module top level; treating multi-tab room sync across instances as acceptance.

### 6. Tests Required

- Local: `nvm use 24.20.0` → `npm run lint -w backend`, `npm run test -w backend`, `npm run build -w backend`.
- Deploy acceptance: after preview Ready, `GET {preview}/api` returns `200` + Hello World (not a boot/framework error page).
- Do not assert durable SSE/room sync across cold starts for this deploy contract.

### 7. Wrong vs Correct

#### Wrong

```typescript
await bootstrap(); // top-level await — Vercel listen patch never completes
```

```bash
# from apps/backend
vercel deploy   # upload misses monorepo root; installCommand breaks
```

#### Correct

```typescript
void bootstrap(); // module finishes evaluating; Vercel binds captured server
```

```bash
# from monorepo root, after link with Root Directory apps/backend
vercel deploy -y --scope clawd-cook
# if prior cache is poisoned:
vercel deploy -y --force --archive=tgz --scope clawd-cook
```

---

## Common Mistakes

1. Linking with Root Directory at repo root — Nest detection and `vercel.json` paths diverge from this contract.
2. Assuming `packages/` on disk is enough at runtime — must materialize into `apps/backend/node_modules/@lejv-party/*`.
3. Committing `.vercel/` or `.env*` — keep local; `.vercel` is gitignored at root and under `apps/backend`.
