# Room Party API Contract (Cross-Layer)

Executable contract for the song-lyric guessing game after monorepo split from MVP.

---

## 1. Scope / Trigger

Applies when changing:

- `apps/backend/src/room/*`
- `packages/domain`, `packages/validation`, `packages/client-core`, `packages/api-client`
- `apps/frontend-web` room UI or `apps/frontend-app` room pages

Single source of truth for types: `@lejv-party/domain`. REST + SSE client: `@lejv-party/api-client`.

---

## 2. Signatures (API)

Global prefix: `/api`. All room routes under `/api/room`.

| Method | Path | Body | Success |
|--------|------|------|---------|
| POST | `/api/room` | `{ nickname }` | `201 { roomId, playerId, state }` |
| POST | `/api/room/:id/join` | `{ nickname }` | `200 { playerId, state }` |
| POST | `/api/room/:id/leave` | `{ playerId }` | `204` |
| PATCH | `/api/room/:id/config` | `{ actorId, patch }` | `204` |
| POST | `/api/room/:id/start` | `{ actorId }` | `204` |
| POST | `/api/room/:id/answer` | `{ playerId, answer }` | `200 { correct }` |
| POST | `/api/room/:id/skip` | `{ actorId }` | `204` |
| GET | `/api/room/:id/stream?p=<playerId>` | — | SSE stream |

Validation schemas: `@lejv-party/validation` (`room.schema.ts`).

---

## 3. Contracts (request/response/env)

### SSE

- Content-Type: `text/event-stream`
- Initial frame: `data: {"type":"room.snapshot","state":{...}}\n\n`
- Events: `RoomEvent` union from `@lejv-party/domain`
- Heartbeat: `:ka\n\n` every ~15s
- **Deploy note**: on Vercel preview, rooms are in-process memory — SSE subscriptions and room state do **not** survive cold starts or multi-instance scale-out. See [vercel-deploy.md](../backend/backend/vercel-deploy.md). Do not treat cross-instance multi-tab sync as acceptance on preview.

### Client state mirror

- Use `clientReducer` from `@lejv-party/client-core`
- `room.snapshot` **fully replaces** local state
- `host.changed` must update `hostId` (host promotion)

### Env (backend)

```
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
PORT=3000
```

### Env (frontends)

| App | Config |
|-----|--------|
| frontend-web | Vite proxy `/api` → `http://localhost:3000`; optional `VITE_API_BASE_URL` |
| frontend-app | `configureApiClient({ baseUrl })`; read `apiBaseUrl` from `lynx.__globalProps` on device (use LAN IP, not `localhost`) |

### Lynx navigation

Room page scheme must include `roomId` and `playerId` (alias `p`):

```
hybrid://lynxview_page?bundle=room.lynx.bundle&roomId=ABC123&playerId=<uuid>
```

---

## 4. Validation & Error Matrix

| Code | HTTP | When |
|------|------|------|
| `ROOM_NOT_FOUND` | 404 | Unknown room |
| `NICKNAME_TAKEN`, `ROOM_FULL`, `GAME_IN_PROGRESS`, … | 409 | Business rule |
| `NOT_HOST`, `NOT_A_MEMBER` | 403 | Authorization |
| `INVALID_BODY` | 400 | Zod parse failure |
| `INTERNAL` | 500 | Unexpected |

Mapping: `@lejv-party/domain` `errorStatus(code)`; backend `RoomExceptionFilter`; client `mapApiErrorBody`.

---

## 5. Good / Base / Bad Cases

**Good**

- H5: EventSource via `subscribeRoomEvents` (auto transport)
- Lynx: `subscribeRoomEvents(..., { transport: 'fetch' })`
- Build packages before apps: `npm run build:packages`

**Base**

- In-memory room store; process restart drops rooms (MVP assumption)

**Bad**

- Duplicating `RoomEvent` or `clientReducer` in an app
- Lynx `localhost` for API on physical device
- HTML elements in Lynx room UI

---

## 6. Tests Required

| Layer | Command | Assert |
|-------|---------|--------|
| domain | `npm run test -w @lejv-party/domain` | `checkAnswer`, normalize |
| client-core | `npm run test -w @lejv-party/client-core` | snapshot replace, host.changed |
| backend | `npm run test -w backend` | reducer join/leave |
| frontend-web | `npm run test:unit -w frontend-web` | home render |
| frontend-app | `npm run test -w frontend-app` | fetch SSE transport |

---

## 7. Wrong vs Correct

**Wrong:** Implement room REST paths in Next.js route handlers inside an app.

**Correct:** NestJS `RoomController` only; frontends call `@lejv-party/api-client`.

**Wrong:** Lynx room page parses player id only from `sessionStorage`.

**Correct:** Parse `roomId` / `playerId` from scheme → `lynx.__globalProps`; optional `loadPlayerId` fallback.
