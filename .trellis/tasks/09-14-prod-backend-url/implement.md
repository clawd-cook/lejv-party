# Implement: Wire production backend URL

## Checklist

1. [x] Add `apps/frontend-web/.env.production` with `VITE_API_BASE_URL=https://www.lejv-party-backend.casa`
2. [x] Set `DEFAULT_BASE_URL` in `apps/frontend-app/src/lib/api.ts` to that origin; update the local/dev comment
3. [ ] Set GitHub repo variable `VITE_API_BASE_URL` (same value) — **blocked: real GitHub CLI not on PATH** (nvm npm package `gh@2.8.9` is not GitHub CLI). Manual step below.
4. [x] Update `.trellis/spec/guides/room-party-api-contract.md` Env (frontends) table for prod origin + override/proxy notes
5. [x] Update `.trellis/spec/backend/backend/vercel-deploy.md` with production custom domain / smoke URL (narrow note; keep preview contract)
6. [ ] Optional: trigger or note Pages redeploy so live SPA picks up the var — after AC2 var is set

## AC2 manual step (GitHub `vars.VITE_API_BASE_URL`)

Real `gh` (GitHub CLI) is **not** available on this machine (`which gh` → nvm npm package named `gh`, not `cli/cli`). Set the repo variable manually:

**UI**

1. Open https://github.com/clawd-cook/lejv-party/settings/variables/actions
2. New repository variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://www.lejv-party-backend.casa` (origin only — **no** `/api` suffix)
3. Save. Re-run or push to trigger `.github/workflows/deploy-frontend-web-pages.yml` so Pages picks it up.

**CLI (when real GitHub CLI is installed)**

```bash
# Must be GitHub’s gh (cli/cli), not the npm package under nvm
gh variable set VITE_API_BASE_URL -R clawd-cook/lejv-party -b 'https://www.lejv-party-backend.casa'
gh variable list -R clawd-cook/lejv-party
```

## Validation (check agent 2026-09-14)

```bash
# Smoke — PASS: 200 + Hello World!
curl -sS "https://www.lejv-party-backend.casa/api"

# frontend-app default — PASS
rg "www.lejv-party-backend.casa" apps/frontend-app/src/lib/api.ts

# frontend-web prod env — PASS; gitignore allowlist `!apps/frontend-web/.env.production` — `git add -n` works
rg "VITE_API_BASE_URL" apps/frontend-web/.env.production

# Type / tests — PASS
nvm use 24.20.0
npm run type-check -w frontend-web
npm run test -w frontend-app -- --run
npm run test:unit -w frontend-web -- --run
```

Confirm GitHub var (when real CLI works):

```bash
gh variable list -R clawd-cook/lejv-party
```

## Risky / rollback points

- Wrong base with `/api` suffix → double `/api/api/...` — never append path prefix
- Setting GH var with fake `gh` CLI fails silently or oddly — verify binary
- Changing app default without documenting override → local device confusion — keep comment + spec

## Review gates before done

- AC1, AC3, AC4, AC5: pass (check agent)
- AC2: documented manual step until real `gh` or UI sets the var
- Specs mention both bake paths for web and default+override for app
