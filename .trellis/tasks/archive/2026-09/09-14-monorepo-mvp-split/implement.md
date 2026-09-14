# Implement: Monorepo split from MVP

## Phase 0 — packages (`09-14-packages-scaffold`) ✓

- [x] `@lejv-party/domain` — types, constants, match, errorStatus
- [x] `@lejv-party/validation` — zod schemas
- [x] `@lejv-party/client-core` — clientReducer, messages, storage
- [x] `@lejv-party/api-client` — REST + SSE
- [x] `@lejv-party/game-data` — songs.json
- [x] Root `npm install`, package build + vitest

## Phase 1 — backend (`09-14-backend-room`) ✓

- [x] RoomModule: store, reducer, orchestrator, SSE, controller
- [x] QuestionEngineModule: filter, translator, cache
- [x] Exception filter + CORS
- [x] Vitest unit tests (reducer); e2e optional follow-up

## Phase 2 — frontend-web (`09-14-frontend-web-room`) ✓

- [x] Tailwind setup
- [x] Home + room routes, Pinia, composables
- [x] Vite proxy to backend
- [x] type-check + unit tests

## Phase 3 — frontend-app (`09-14-frontend-app-room`) ✓

- [x] home + room Sparkling pages
- [x] Shared client-core + api-client
- [x] Lynx SSE transport (`fetch`)
- [x] build + vitest
- [ ] Device runtime vs backend (blocked — no device session; use host LAN IP not localhost)

## Validation commands

```bash
nvm use 24.20.0
npm install
npm run build -w @lejv-party/domain
npm run test -w @lejv-party/domain
npm run build -w backend
npm run test -w backend
npm run type-check -w frontend-web
npm run build -w frontend-app
```
