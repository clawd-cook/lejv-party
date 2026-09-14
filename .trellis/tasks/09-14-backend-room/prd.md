# PRD: Backend room module (Phase 1)

## Goal

NestJS backend exposing MVP-equivalent room REST + SSE APIs under `/api/room/*`.

## Acceptance criteria

1. POST `/api/room` creates room (201 + roomId, playerId, state)
2. join / leave / config / start / answer / skip routes match MVP semantics
3. GET `/api/room/:id/stream?p=` SSE with snapshot + heartbeat
4. QuestionEngine loads songs from `@lejv-party/game-data`
5. `npm run build -w backend` and `npm run test -w backend` pass

## Status

Phase 1 core implementation complete. E2E against live server optional follow-up.
