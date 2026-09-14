# PRD: Monorepo split from MVP

## Summary

Migrate the song-lyric guessing party game from `lejv-party-mvp/` (Next.js monolith) into the npm workspaces monorepo: shared `packages/`, NestJS backend, Vue H5 (`frontend-web`), and ReactLynx app (`frontend-app`).

## Source of truth

- MVP codebase: `lejv-party-mvp/`
- MVP design: `lejv-party-mvp/.trellis/tasks/09-13-song-lyric-guess-party/design.md`

## Requirements

### Functional (unchanged from MVP)

- Create/join room with 6-char room code and 1–16 char nickname
- Lobby: host config (CEFR level, eras, genres, victory score), up to 8 players
- Game: AI-translated lyric line, 90s buzz-in, Levenshtein ≤1 title match
- Real-time sync via SSE (`RoomEvent` stream)
- Phases: lobby → question → reveal → ended
- Host promotion when host leaves (R-03)

### Architectural

- **packages/** — shared types, validation, client reducer, API client, song data
- **apps/backend** — room orchestrator, reducer, SSE bus, question engine (NestJS)
- **apps/frontend-web** — Vue 3 H5 UI, Tailwind aligned with MVP visuals
- **apps/frontend-app** — ReactLynx pages sharing `@lejv-party/client-core` + `@lejv-party/api-client`

### Non-goals (same as MVP)

- No database, Redis, or horizontal scaling
- No WebSocket (SSE only)
- No LLM answer judging

## Acceptance criteria

1. All five packages build and unit-test independently
2. Backend exposes MVP-equivalent REST + SSE under `/api/room/*`
3. frontend-web completes create → lobby → play → end flow against backend
4. frontend-app completes the same flow on Lynx (SSE via fetch transport if needed)
5. No duplicate domain types between apps; single source in `@lejv-party/domain`

## Child tasks

| Task | Scope |
|------|--------|
| `09-14-packages-scaffold` | Phase 0 — shared packages |
| `09-14-backend-room` | Phase 1 — NestJS room module |
| `09-14-frontend-web-room` | Phase 2 — Vue H5 UI |
| `09-14-frontend-app-room` | Phase 3 — Lynx UI |

## Decisions (confirmed)

- H5 styling: **Tailwind**, visual parity with MVP
- Package manager: **npm** (monorepo root)
- Node: **24.20.0**
