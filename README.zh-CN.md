<p align="center">
  <img src="apps/frontend-app/resource/app_icon.png" width="96" alt="lejv-party" />
</p>

# lejv-party

[English](README.md) | **简体中文**

![Node.js](https://img.shields.io/badge/Node.js-24.20.0-3c873a?style=flat-square)
![npm](https://img.shields.io/badge/packageManager-npm%4011.19.0-cb3837?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

多人在线「歌词猜猜猜」派对游戏：房主创建房间，玩家抢答英译歌词对应的中文歌名。服务端权威状态机 + SSE 实时同步；H5（Vue）与跨端 App（ReactLynx / Sparkling）共用一套领域类型与 API 客户端。

[概览](#概览) · [特性](#特性) · [架构](#架构) · [快速开始](#快速开始) · [本地运行](#本地运行) · [API](#api) · [工作区](#工作区)

---

## 概览

本仓库是 **npm workspaces monorepo**，按端拆分应用与共享包：

| 层级 | 路径 | 技术栈 |
| --- | --- | --- |
| 后端 | `apps/backend` | NestJS 12 · Express · 内存房间 · SSE · AI 歌词翻译 |
| H5 | `apps/frontend-web` | Vue 3 · Vite · Pinia · Vue Router · Tailwind CSS 4 |
| App | `apps/frontend-app` | ReactLynx · Sparkling · rspeedy |
| 共享 | `packages/*` | 领域类型、Zod 校验、客户端 reducer、REST/SSE 客户端、曲库 |

**玩法流程：**

1. 用 1–16 字符昵称创建或加入 6 位房间号。
2. 房主配置 CEFR 词汇量、年代、曲风、胜利分数后开局。
3. 每轮由 AI 将一行中文歌词翻译为对应 CEFR 等级的英文。
4. 玩家抢答歌名（归一化后编辑距离 ≤ 1），先答对者得分。
5. 阶段流转：`lobby` → `question` → `reveal` → `ended`；房主离开时会自动移交房主。

> [!IMPORTANT]
> 房间状态保存在**进程内存**中，重启后端会清空所有房间。当前未接入 Redis / 数据库，本地演示请保持 Node 进程长驻运行。

---

## 特性

- **服务端权威** — 纯 reducer + orchestrator；抢答公平性由 POST 到达顺序决定
- **SSE 广播** — 连接时推送 `room.snapshot`，后续 typed `RoomEvent`，15s 心跳
- **共享包** — Vue 与 Lynx 共用 `RoomEvent` / `clientReducer`，领域类型不重复
- **双端客户端** — H5 使用 EventSource，Lynx 使用 fetch 版 SSE
- **AI 翻译** — 通过 Vercel AI SDK 对接 OpenAI 兼容 API（`AI_*` 环境变量）

---

## 架构

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

跨层契约详见 [`.trellis/spec/guides/room-party-api-contract.md`](.trellis/spec/guides/room-party-api-contract.md)。

---

## 快速开始

### 环境要求

- **nvm**，且 **Node.js 必须为 `v24.20.0`**（详见 [AGENTS.md](AGENTS.md)）
- **npm**（锁文件为 `package-lock.json`；请勿使用 pnpm / yarn / bun 安装依赖）
- OpenAI 兼容 API（仅测大厅时可暂不配置）

### 安装

```bash
export NVM_DIR="$HOME/.nvm"
. "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 24.20.0

node -v    # 必须输出 v24.20.0
which node # 必须为 $HOME/.nvm/versions/node/v24.20.0/bin/node

npm install
npm run build:packages
```

> [!WARNING]
> 请勿使用 Homebrew Node 或其他 nvm 版本。若 `node -v` 不是 `v24.20.0`，请先修正 shell 再继续。

### 后端环境变量

```bash
cp apps/backend/.env.example apps/backend/.env
```

| 变量 | 说明 |
| --- | --- |
| `AI_BASE_URL` | OpenAI 兼容 API 地址 |
| `AI_API_KEY` | API Key |
| `AI_MODEL` | 模型 ID |
| `PORT` | 默认 `3000` |

---

## 本地运行

### 1. 后端

```bash
nvm use 24.20.0
npm run start:dev -w backend
```

API 根路径：`http://localhost:3000/api`

### 2. H5（Vue）

```bash
nvm use 24.20.0
npm run dev -w frontend-web
```

Vite 将 `/api` 代理到 `http://localhost:3000`，浏览器打开终端输出的地址（通常为 `http://localhost:5173`）。

### 3. App（Lynx / Sparkling）

```bash
nvm use 24.20.0
npm run build -w frontend-app
npm run run:ios -w frontend-app
# 或
npm run run:android -w frontend-app
```

> [!NOTE]
> 真机上 `localhost` 指向手机本身，需通过 Lynx `__globalProps`（或 scheme）传入 `apiBaseUrl`，指向开发机局域网 IP，例如 `http://192.168.x.x:3000`。SSE 使用 `transport: 'fetch'`。

### 常用脚本

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

全局前缀 `/api`，房间相关路由：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/room` | 创建房间 → `201 { roomId, playerId, state }` |
| `POST` | `/room/:id/join` | 加入大厅 |
| `POST` | `/room/:id/leave` | 离开 → `204` |
| `PATCH` | `/room/:id/config` | 房主修改配置 |
| `POST` | `/room/:id/start` | 房主开始游戏 |
| `POST` | `/room/:id/answer` | 抢答 → `{ correct }`，并广播 SSE |
| `POST` | `/room/:id/skip` | 房主跳过本题 |
| `GET` | `/room/:id/stream?p=<playerId>` | SSE（含 `room.snapshot`、事件流、`:ka` 心跳） |

请求体由 `@lejv-party/validation`（Zod）校验。错误响应：`{ error: <code>, message? }`，错误码定义在 `@lejv-party/domain`。

---

## 工作区

```
lejv-party/
├── apps/
│   ├── backend/          # NestJS 房间与出题引擎
│   ├── frontend-web/     # Vue H5
│   └── frontend-app/     # ReactLynx / Sparkling
├── packages/
│   ├── domain/           # 类型、match、errorStatus
│   ├── validation/       # Zod schemas
│   ├── client-core/      # clientReducer、错误文案、storage
│   ├── api-client/       # REST + SSE 订阅
│   └── game-data/        # 曲库 songs.json
├── AGENTS.md             # Agent / 运行时约定
└── .trellis/             # Trellis 工作流与 spec
```

| 包名 | 用途 |
| --- | --- |
| `@lejv-party/domain` | 共享类型与答题匹配 |
| `@lejv-party/validation` | HTTP 请求体校验 |
| `@lejv-party/client-core` | 客户端状态机 |
| `@lejv-party/api-client` | `createRoom`、`subscribeRoomEvents` 等 |
| `@lejv-party/game-data` | 曲库 JSON |

---

## 开发说明

- Agent 约定与技能路由见 [AGENTS.md](AGENTS.md)。
- 大规模改动前请阅读 `.trellis/spec/` 下对应 package 的 index。
