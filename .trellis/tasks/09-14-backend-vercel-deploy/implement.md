# Implement: backend → Vercel preview

## Checklist

1. [x] Ensure nvm `24.20.0` in the shell (`node -v`, `which node`).
2. [x] Add `apps/backend/vercel.json` with monorepo `installCommand` / `buildCommand` (domain → validation → backend).
3. [x] Add `.vercel` to root `.gitignore` if missing.
4. [x] Link project: created `lejv-party-backend` under `clawd-cook`; Root Directory `apps/backend`; CLI deploy from **repo root**.
5. [x] Set project Node to 24.x if the link UI/CLI exposes it.
6. [x] Preview deploy: `vercel deploy -y --no-wait --scope clawd-cook` from the linked monorepo root.
7. [x] `vercel inspect <url>` until ready (or poll status); record preview URL.
8. [x] Smoke: `GET {preview}/api` returns Hello World (or equivalent 200).
9. [x] Do **not** upload `AI_*`; do **not** `git push` unless user explicitly asks.
10. [x] Note serverless limits in wrap-up / journal if needed.

## Preview URL (latest remote-build)

- https://lejv-party-backend-lp09qqdqo-clawd-cook.vercel.app
- Smoke: `GET /api` → `Hello World!` (200)
- Project: `clawd-cook/lejv-party-backend` (Node 24.x, framework nestjs)
- Install: `cd ../.. && npm install` · Build: `bash scripts/vercel-build.sh`
- SSO deployment protection disabled so the preview API is publicly reachable
- `AI_*` / Observe env: unset (translator + Observe remain off)

## Validation

```bash
export NVM_DIR="$HOME/.nvm"
. "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 24.20.0
node -v   # v24.20.0
vercel whoami
# after deploy:
# curl -sS "https://<preview>/api"
```

Local optional: from `apps/backend`, `vercel build` / `vercel dev` only if CLI deploy fails and diagnosis needs it.

## Risky points

- Workspace install from wrong cwd → missing `@lejv-party/*`.
- Nest not detected if Root Directory wrong or entry renamed.
- Interactive `vercel link` prompts — use non-interactive flags where possible; if blocked, ask user to complete prompts.
- SSE/memory: do not treat multi-tab room sync as acceptance.
- Do **not** top-level-await `bootstrap()` — Vercel’s listen patch never emits `listening`, so the entry module hangs.
- Materialize `@lejv-party/*` into `apps/backend/node_modules` during build (workspace symlinks alone are not enough in the function bundle).

## Rollback points

- After config files only: `git checkout --` those paths.
- After link: dashboard unlink/delete project; remove `.vercel/`.
- After deploy: leave preview; no prod to roll back.

## Before `task.py start`

- [x] `prd.md` converged
- [x] `design.md` + `implement.md` written
- [ ] User reviewed / approved start
- [ ] `implement.jsonl` + `check.jsonl` curated (step 1.3)
