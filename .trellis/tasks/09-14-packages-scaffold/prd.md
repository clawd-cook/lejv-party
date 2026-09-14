# PRD: Shared packages scaffold (Phase 0)

## Goal

Extract MVP shared logic into five npm workspace packages under `packages/`.

## Acceptance criteria

1. Each package has `package.json`, `tsconfig.json`, builds to `dist/`
2. `@lejv-party/domain` exports all room types, `checkAnswer`, `errorStatus`
3. `@lejv-party/validation` exports zod schemas matching MVP API bodies
4. `@lejv-party/client-core` exports `clientReducer` behavior-identical to MVP
5. `@lejv-party/api-client` exports typed room REST + SSE subscription helper
6. `@lejv-party/game-data` exports song-lyric JSON (30+ songs)
7. Vitest tests pass for `domain` (match) and `client-core` (reducer smoke)

## Out of scope

- Backend NestJS wiring (Phase 1)
- Any frontend UI (Phase 2–3)
