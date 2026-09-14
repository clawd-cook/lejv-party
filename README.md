<p align="center">
  <img src="apps/frontend-app/resource/app_icon.png" width="96" alt="lejv-party" />
</p>

# lejv-party

**English** | [简体中文](README.zh-CN.md)

![Node.js](https://img.shields.io/badge/Node.js-24.20.0-3c873a?style=flat-square)
![npm](https://img.shields.io/badge/packageManager-npm%4011.19.0-cb3837?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

Multiplayer song-lyric guessing party game: the host creates a room, players buzz in to match English lyric translations with Chinese song titles. Server-authoritative state machine with SSE sync; H5 (Vue) and cross-platform App (ReactLynx / Sparkling) share domain types and an API client.

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Getting started](#getting-started) · [Run locally](#run-locally) · [API](#api) · [Workspace](#workspace)

---

## Overview

This repo is an **npm workspaces monorepo** split by app and shared packages:

| Layer | Path | Stack |
| --- | --- | --- |
| Backend | `apps/backend` | NestJS 12 · Express · in-memory rooms · SSE · AI lyric translation |
| H5 | `apps/frontend-web` | Vue 3 · Vite · Pinia · Vue Router · Tailwind CSS 4 |
| App | `apps/frontend-app` | ReactLynx · Sparkling · rspeedy |
| Shared | `packages/*` | Domain types, Zod schemas, client reducer, REST/SSE client, song bank |

**Gameplay:**

1. Create or join a 6-character room with a nickname (1–16 chars).
2. Host configures CEFR level, eras, genres, victory score; starts the game.
3. Each round: AI translates a Chinese lyric line into English within the chosen CEFR band.
4. Players buzz in with the song title (Levenshtein ≤ 1 after normalize). First correct answer scores.
5. Phases: `lobby` → `question` → `reveal` → `ended`. Host promotion when the host leaves.

> [!IMPORTANT]
> Rooms live in **process memory**. Restarting the backend drops all rooms. There is no Redis / DB yet. Prefer a long-lived Node process for local demos.

---

## Features

- **Server-authoritative game loop** — pure reducer + orchestrator; fair buzz-in by POST arrival order
- **SSE fan-out** — `room.snapshot` on connect, typed `RoomEvent` stream, 15s keepalive
- **Shared packages** — one `RoomEvent` / `clientReducer` for Vue and Lynx; no duplicated domain types
- **Dual clients** — browser H5 (EventSource) and Lynx (fetch-based SSE transport)
- **AI translation** — OpenAI-compatible provider via Vercel AI SDK (`AI_*` env)

---

## Architecture

```
┌─────────────────┐  ┌──────────────────┐
│  frontend-web   │  │  frontend-app    │
│  Vue 3 + Vite   │  │  ReactLynx       │
└────────┬────────┘  └────────┬─────────┘
         │  @lejv-party/api-client        │
         │  @lejv-party/client-core       │
         └──────────────┬─────────────────┘
                        │  REST + SSE  /api/room/*
                        ▼
              ┌─────────────────────┐
              │  apps/backend       │
              │  NestJS RoomModule  │
              │  QuestionEngine     │
              └─────────┬───────────┘
                        │
              @lejv-party/domain · validation · game-data
```

Cross-layer contract: [`.trellis/spec/guides/room-party-api-contract.md`](.trellis/spec/guides/room-party-api-contract.md).

---

## Getting started

### Prerequisites

- **nvm** with **Node.js exactly `v24.20.0`** (see [AGENTS.md](AGENTS.md))
- **npm** (lockfile is `package-lock.json`; do not use pnpm/yarn/bun for installs)
- An OpenAI-compatible API endpoint for lyric translation (optional for lobby-only testing)

### Install

```bash
export NVM_DIR="$HOME/.nvm"
. "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 24.20.0

node -v    # must print v24.20.0
which node # must be $HOME/.nvm/versions/node/v24.20.0/bin/node

npm install
npm run build:packages
```

> [!WARNING]
> Do not use Homebrew Node or another nvm version for this repo. If `node -v` is not `v24.20.0`, stop and fix the shell before continuing.

### Backend env

```bash
cp apps/backend/.env.example apps/backend/.env
```

| Variable | Description |
| --- | --- |
| `AI_BASE_URL` | OpenAI-compatible base URL |
| `AI_API_KEY` | API key |
| `AI_MODEL` | Model id |
| `PORT` | Defaults to `3000` |

---

## Run locally

### 1. Backend

```bash
nvm use 24.20.0
npm run start:dev -w backend
```

API base: `http://localhost:3000/api`

### 2. H5 (Vue)

```bash
nvm use 24.20.0
npm run dev -w frontend-web
```

Vite proxies `/api` → `http://localhost:3000`. Open the printed local URL (usually `http://localhost:5173`).

### 3. App (Lynx / Sparkling)

```bash
nvm use 24.20.0
npm run build -w frontend-app
npm run run:ios -w frontend-app
# or
npm run run:android -w frontend-app
```

> [!NOTE]
> On a physical device, `localhost` is the phone — pass `apiBaseUrl` via Lynx `__globalProps` (or scheme) pointing at your machine’s LAN IP, e.g. `http://192.168.x.x:3000`. SSE uses `transport: 'fetch'`.

### Useful scripts

```bash
npm run build:packages
npm run test:packages

npm run build -w backend
npm run test -w backend
npm run lint -w backend

npm run type-check -w frontend-web
npm run test:unit -w frontend-web
npm run lint -w frontend-web

npm run build -w frontend-app
npm run test -w frontend-app
```

---

## API

Prefix: `/api`. Room routes:

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/room` | Create room → `201 { roomId, playerId, state }` |
| `POST` | `/room/:id/join` | Join lobby |
| `POST` | `/room/:id/leave` | `204` |
| `PATCH` | `/room/:id/config` | Host-only config patch |
| `POST` | `/room/:id/start` | Host starts game |
| `POST` | `/room/:id/answer` | `{ correct }` + SSE `answer.submitted` |
| `POST` | `/room/:id/skip` | Host skip question |
| `GET` | `/room/:id/stream?p=<playerId>` | SSE (`room.snapshot`, events, `:ka` heartbeat) |

Request bodies are validated with `@lejv-party/validation` (Zod). Error body shape: `{ error: <code>, message? }` with stable codes from `@lejv-party/domain`.

---

## Workspace

```
lejv-party/
├── apps/
│   ├── backend/          # NestJS room + question engine
│   ├── frontend-web/     # Vue H5
│   └── frontend-app/     # ReactLynx / Sparkling
├── packages/
│   ├── domain/           # types, match, errorStatus
│   ├── validation/       # Zod schemas
│   ├── client-core/      # clientReducer, error copy, storage helpers
│   ├── api-client/       # REST + SSE subscription
│   └── game-data/        # song-lyric songs.json
├── AGENTS.md             # agent / runtime rules
└── .trellis/             # Trellis workflow & specs
```

| Package | Import |
| --- | --- |
| `@lejv-party/domain` | Shared types & answer matching |
| `@lejv-party/validation` | HTTP body schemas |
| `@lejv-party/client-core` | Client state machine |
| `@lejv-party/api-client` | `createRoom`, `subscribeRoomEvents`, … |
| `@lejv-party/game-data` | Song bank JSON |

---

## Development notes

- Agent-oriented conventions and skill routing live in [AGENTS.md](AGENTS.md).
- Trellis specs under `.trellis/spec/` — load the matching package index before large edits.
