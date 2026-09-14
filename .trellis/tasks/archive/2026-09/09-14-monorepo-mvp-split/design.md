# Design: Monorepo split from MVP

See conversation design doc and MVP `design.md` for full detail. This file captures monorepo-specific boundaries.

## Package graph

```
@lejv-party/domain          (types, constants, match, errorStatus)
@lejv-party/validation      (zod schemas → domain)
@lejv-party/client-core     (clientReducer, error messages, storage)
@lejv-party/api-client      (REST + SSE subscription)
@lejv-party/game-data       (songs.json)
```

## App responsibilities

| Layer | Owns | Does not own |
|-------|------|----------------|
| backend | orchestrator, in-memory store, SSE, AI translate | UI |
| frontend-web | Vue views, Pinia, composables | business rules |
| frontend-app | Lynx pages, hooks | business rules |

## API prefix

All room routes: `/api/room/...` (NestJS global prefix `/api`).

## SSE transport abstraction

`@lejv-party/api-client` exposes `subscribeRoomEvents(roomId, playerId, onEvent)` with:

1. `EventSource` when available (browser H5)
2. Fetch-based SSE parser fallback (Lynx)

## Migration mapping

| MVP path | Target |
|----------|--------|
| `lib/room/types.ts` | `packages/domain` |
| `lib/room/match.ts` | `packages/domain` |
| `lib/schemas/room.ts` | `packages/validation` |
| `lib/http.ts` errorStatus | `packages/domain` |
| `app/room/[id]/_reducer.ts` | `packages/client-core` |
| `lib/orchestrator.ts` | `apps/backend/src/room/` |
| `lib/event-bus.ts` | `apps/backend/src/room/sse-event-bus.service.ts` |
| `lib/question-engine/*` | `apps/backend/src/question-engine/` |
| `app/api/room/*` | `apps/backend/src/room/room.controller.ts` |
| `app/room/*` UI | `apps/frontend-web` + `apps/frontend-app` |

## Rollback

Packages and backend modules are additive. Rollback = revert branch; MVP folder remains untouched as reference.
