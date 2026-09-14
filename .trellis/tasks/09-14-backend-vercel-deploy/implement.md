# Implement: backend → Vercel preview

## Checklist

1. [ ] Ensure nvm `24.20.0` in the shell (`node -v`, `which node`).
2. [ ] Add `apps/backend/vercel.json` with monorepo `installCommand` / `buildCommand` (domain → validation → backend).
3. [ ] Add `.vercel` to root `.gitignore` if missing.
4. [ ] Link project: `vercel link --repo --scope clawd-cook` from repo root **or** link inside `apps/backend` with Root Directory `apps/backend` if repo link cannot target backend alone. Prefer project name like `lejv-party-backend`.
5. [ ] Set project Node to 24.x if the link UI/CLI exposes it.
6. [ ] Preview deploy: `vercel deploy -y --no-wait --scope clawd-cook` from the linked backend context (path/root as linked).
7. [ ] `vercel inspect <url>` until ready (or poll status); record preview URL.
8. [ ] Smoke: `GET {preview}/api` returns Hello World (or equivalent 200).
9. [ ] Do **not** upload `AI_*`; do **not** `git push` unless user explicitly asks.
10. [ ] Note serverless limits in wrap-up / journal if needed.

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

## Rollback points

- After config files only: `git checkout --` those paths.
- After link: dashboard unlink/delete project; remove `.vercel/`.
- After deploy: leave preview; no prod to roll back.

## Before `task.py start`

- [x] `prd.md` converged
- [x] `design.md` + `implement.md` written
- [ ] User reviewed / approved start
- [ ] `implement.jsonl` + `check.jsonl` curated (step 1.3)
