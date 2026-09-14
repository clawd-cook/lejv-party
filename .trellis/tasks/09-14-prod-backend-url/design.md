# Design: Wire production backend URL

## Architecture / Boundaries

| Surface | Change | Boundary |
|---------|--------|----------|
| frontend-web | Production env bake-in | Build-time only; `npm run dev` without env still uses relative `/api` + Vite proxy |
| frontend-app | Default base URL constant | Runtime; globalProps override unchanged |
| GitHub Actions | Repo variable | Ops config for Pages workflow; complements committed `.env.production` |
| Specs | Contract docs | Discoverability; no runtime effect |

No Nest code changes. API path contract unchanged.

## Contracts

**Canonical production origin**

```
https://www.lejv-party-backend.casa
```

**frontend-web**

- File: `apps/frontend-web/.env.production`
- Content: `VITE_API_BASE_URL=https://www.lejv-party-backend.casa`
- Pages: `vars.VITE_API_BASE_URL` must match (workflow fails if empty)
- Client paths already start with `/api/...`

**frontend-app**

- `DEFAULT_BASE_URL = 'https://www.lejv-party-backend.casa'`
- Override order unchanged: `apiBaseUrl` / `api_base_url` on `__globalProps` or nested query/scheme → else default

## Data flow

```
frontend-web (prod build) ──VITE_API_BASE_URL──► api-client ──► https://www.lejv-party-backend.casa/api/...
frontend-app (default)    ──DEFAULT_BASE_URL──► api-client ──► same
frontend-web (dev)        ──empty base + proxy──► localhost:3000/api/...
frontend-app (override)   ──apiBaseUrl LAN/IP──► local Nest
```

## Compatibility

- Existing LAN/device workflow: pass `apiBaseUrl` as today
- Empty `VITE_API_BASE_URL` in web dev: unchanged proxy behavior
- CORS already open on production Nest (`enableCors()`)

## Trade-offs

| Choice | Pro | Con |
|--------|-----|-----|
| App default = prod | Device works without scheme param | Local Nest needs explicit override |
| Dual web bake (file + GH var) | Local `vite build` + CI align | Two places to update if domain changes |
| Commit non-secret origin | Reviewable in git | Domain rotation needs a PR |

## Rollback

- Revert `DEFAULT_BASE_URL` and delete/revert `.env.production`
- Reset or unset GitHub `VITE_API_BASE_URL` if needed
- Redeploy Pages / rebuild app bundles after revert
