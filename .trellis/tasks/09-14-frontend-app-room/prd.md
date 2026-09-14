# PRD: Frontend-app Lynx room UI (Phase 3)

## Goal

Implement the song-lyric party game home + room flow on ReactLynx / Sparkling (`apps/frontend-app`), reusing shared packages from Phase 0.

## Requirements

1. **Home page** (`pages/home`): create room / join room with nickname + room code; navigate to room page with `playerId`.
2. **Room page** (`pages/room`): SSE subscription via `@lejv-party/api-client` with `transport: 'fetch'`; mirror state with `@lejv-party/client-core` `clientReducer`.
3. **Phases**: lobby (config + start), question (buzzer + countdown), reveal, ended — same semantics as MVP / frontend-web.
4. **Lynx constraints**: use `<view>` / `<text>` / `bindtap`; no HTML elements; CSS must be Lynx-supported.
5. **API**: call NestJS backend at configurable base URL (default `http://localhost:3000`).

## Acceptance criteria

- [ ] `home` and `room` bundles registered in `app.config.ts`
- [ ] Shared packages wired: `@lejv-party/domain`, `client-core`, `api-client`
- [ ] Create → lobby → play → end flow works against backend (or documented blocked if device unavailable)
- [ ] `npm run build -w frontend-app` and `npm run test -w frontend-app` pass
- [ ] No HTML tags; ReactLynx dual-thread rules followed (`bindtap`, `'background only'` where needed)

## Non-goals

- Pixel-perfect Tailwind parity with H5
- Native EventSource (use fetch SSE)
- Redis / persistence

## Notes

Depends on Phase 0 packages and Phase 1 backend APIs.
