# AGENTS.md

npm workspaces monorepo (`packageManager`: `npm@11.19.0`). Apps live under `apps/`; shared packages (currently empty) under `packages/`.

| Workspace | Path | Stack |
| --- | --- | --- |
| `frontend-web` | `apps/frontend-web` | Vue 3 + Vite + Pinia + Vue Router |
| `frontend-app` | `apps/frontend-app` | ReactLynx / Sparkling (`@lynx-js/react`, rspeedy) |
| `backend` | `apps/backend` | NestJS 12 + Express |

## Runtime (hard constraint)

Develop and run this repo **only** with the **local nvm Node.js 24.20.0** install. Do not use any other Node version, package manager, or isolated environment.

Pinned version: **v24.20.0**

`.node-version` is `24` (major only). Always pass the patch version explicitly (`nvm use 24.20.0`). Do not rely on `.node-version` to select 24.20.0.

Before any install, lint, typecheck, or app scripts:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 24.20.0
```

Confirm both of these before continuing:

```bash
node -v          # must print v24.20.0
which node       # must be $HOME/.nvm/versions/node/v24.20.0/bin/node
```

If `node -v` is not `v24.20.0`, **stop**. Do not fall back.

`nvm use 24.20.0` in the **current shell** is required and does not need extra confirmation. Do **not** change nvm’s default alias, install another Node, or edit shell rc files to make 24 global.

### Do not use

- Homebrew Node (`/opt/homebrew/bin/node`, may be newer than 24)
- Other nvm versions on this machine (anything except `v24.20.0`)
- Docker, Dev Containers, Nix, asdf, fnm, volta, n, or cloud/CI sandboxes for local work
- `pnpm`, `yarn`, or `bun` for dependency install (lockfile is `package-lock.json`; `packageManager` is npm)
- Introducing a second runtime or changing the pinned Node without an explicit user request

## High-risk operations (ask first)

**Stop and get an explicit yes from the user** before any operation that changes the machine outside this repository. Do not proceed on implied consent, “it would help”, or because a skill/docs suggested it.

Requires confirmation:

- **Global package installs** — `npm i -g`, `pnpm add -g`, `yarn global`, `bun add -g`, `brew install` / `brew upgrade`, OS package managers, editor/CLI plugins installed for all projects
- **Global or extra-repo deletes** — anything outside the checkout: `~/.nvm`, Homebrew prefixes, `/usr/local`, `/opt/homebrew`, other clones, shell history, credentials, nvm versions, `rm -rf` on home or system paths
- **Global environment switches** — `nvm alias default`, `nvm install`, `nvm uninstall`, changing default Node, editing `~/.zshrc` / `~/.bashrc` / `~/.zprofile`, mutating `PATH` persistently, Docker/context switches, logging into cloud CLIs
- **Destructive git/machine actions** — `git push --force`, hard reset of shared branches, rewriting git config, skipping hooks
- **Secrets and identity** — writing credentials, SSH keys, tokens, or changing git `user.*`

How to ask: state the exact command, what it changes (path + scope), why you think it is needed, and a repo-local alternative if one exists (`npm install -D`, `npx`, `npm exec`). Wait for a clear yes. If the user says no or does not answer, skip it and continue with in-repo tools only.

Prefer in-repo, session-local work: `npm install` / `npm install -D` in the right workspace, `npx`, `npm exec`, and `nvm use 24.20.0` in this shell.

## Required skills (mandatory)

Read the listed `SKILL.md` **before** writing or reviewing that kind of code. Follow the skill; do not improvise from memory. User chat instructions and this file still win if they conflict with a skill (Node 24.20.0, npm only, no extra environments, ask before global installs).

Before editing a layer, also load that package’s spec index under `.trellis/spec/` (see Trellis block below).

| When | Skill | Path |
| --- | --- | --- |
| Vue / `.vue` / Vite + Vue in `apps/frontend-web` | `vue-best-practices` | `.agents/skills/vue-best-practices/SKILL.md` |
| Vue Router | `vue-router-best-practices` | `.agents/skills/vue-router-best-practices/SKILL.md` |
| Pinia | `vue-pinia-best-practices` | `.agents/skills/vue-pinia-best-practices/SKILL.md` |
| Vue unit / component tests | `vue-testing-best-practices` | `.agents/skills/vue-testing-best-practices/SKILL.md` |
| Vue runtime bugs / warnings | `vue-debug-guides` | `.agents/skills/vue-debug-guides/SKILL.md` |
| Reusable Vue composables | `create-adaptable-composable` | `.agents/skills/create-adaptable-composable/SKILL.md` |
| NestJS in `apps/backend` | `nestjs-best-practices` | `.agents/skills/nestjs-best-practices/SKILL.md` |
| ReactLynx / Sparkling in `apps/frontend-app` | `reactlynx-best-practices` **and** `lynx-api-docs` | `.agents/skills/reactlynx-best-practices/SKILL.md`, `.agents/skills/lynx-api-docs/SKILL.md` |
| Lynx TypeScript errors or `tsconfig` | `lynx-typescript` | `.agents/skills/lynx-typescript/SKILL.md` |
| Lynx CSS support vs web CSS | `lynx-check-css-support` | `.agents/skills/lynx-check-css-support/SKILL.md` |
| `lynx-ui` components / Luna themes | `lynx-ui` | `.agents/skills/lynx-ui/SKILL.md` |
| Device / CDP debug of a running Lynx app | `lynx-devtool` | `.agents/skills/lynx-devtool/SKILL.md` |
| Rspeedy / `.lynx.bundle` size | `rspeedy-bundle-size` | `.agents/skills/rspeedy-bundle-size/SKILL.md` |
| Vanilla Lynx Element PAPI / `.lynxml` (not ReactLynx) | `vanilla-lynx` | `.agents/skills/vanilla-lynx/SKILL.md` |
| Habitat / `.habitat/DEPS` (only if that config exists) | `habitat-usage` | `.agents/skills/habitat-usage/SKILL.md` |

Situational (load only when the request is that format): `lynx-a2ui`, `lynx-openui`, `lynx-trace-record`, `lynx-trace-analysis`, `lynx-debug-info-remapping`. Load `vue-options-api-best-practices` or `vue-jsx-best-practices` only if the touched Vue code actually uses Options API or JSX.

### Vue (`apps/frontend-web`)

Default to Vue 3 Composition API with `<script setup lang="ts">`. Use the `@/` alias (`src/*`). Typecheck with `vue-tsc`, not `tsc`. After UI/runtime edits, verify in the browser; for Vue-specific failures also load `vue-debug-guides`.

### ReactLynx (`apps/frontend-app`)

Lynx is not a browser. Read `lynx-api-docs` (and `lynx-check-css-support` for CSS) before writing page/layout/style code. Use Lynx elements (`<view>`, `<text>`, `<image>`), not HTML. Follow ReactLynx dual-thread rules (`reactlynx-best-practices`): `bindtap` / `catchtap`, `'background only'`, main-thread vs background. Do not treat web CSS or React DOM knowledge as sufficient.

### NestJS (`apps/backend`)

Follow `nestjs-best-practices` (modules, DI, exception filters, security). Open the matching `rules/*.md` for the category you are changing. Lint with `oxlint`; tests with Vitest.

## Setup Commands

Use **npm** and Node 24.20.0 only. Install from the **repo root** so workspaces resolve together.

```bash
export NVM_DIR="$HOME/.nvm"
. "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 24.20.0
npm install
```

Do not run `pnpm install`, `yarn`, or `bun install`.

## Development Workflow

Run workspace scripts with `npm run <script> -w <workspace>` after `nvm use 24.20.0`.

```bash
nvm use 24.20.0

# frontend-web (Vue)
npm run dev -w frontend-web
npm run build -w frontend-web
npm run lint -w frontend-web
npm run type-check -w frontend-web
npm run test:unit -w frontend-web

# backend (NestJS)
npm run start:dev -w backend
npm run build -w backend
npm run lint -w backend
npm run test -w backend
npm run test:e2e -w backend

# frontend-app (Lynx / Sparkling)
npm run build -w frontend-app
npm run test -w frontend-app
npm run run:android -w frontend-app
npm run run:ios -w frontend-app
```

Do not commit `.env*` (gitignored) unless the user explicitly asks.

## Code Style

- TypeScript-first. Keep `strict` on (all three apps enable it).
- Vue: Composition API + `<script setup lang="ts">`; Pinia for shared state; Vue Router for routes. Do not introduce Options API or Vue JSX unless the existing file already uses them.
- ReactLynx: follow `reactlynx-best-practices` and `lynx-api-docs`. Match existing Sparkling page structure under `src/pages/`.
- NestJS: modules / controllers / providers; follow existing file layout under `apps/backend/src/`.
- Imports: ESM (`import` / `export`). `frontend-web` uses `@/` for `src/*`.
- Styling: match the app you are in (Vue SFC scoped CSS; Lynx CSS in the Sparkling app). Do not add another CSS framework without asking.
- Formatting: match surrounding files; do not mass-reformat.
- Keep diffs small. Do not rewrite `README.md` or skill files unless asked.

## Build and Deployment

```bash
nvm use 24.20.0
npm run build -w frontend-web
npm run build -w backend
npm run build -w frontend-app
```

- Vue / Nest output: `dist/` (gitignored).
- Lynx / Sparkling: `.lynx.bundle` via `sparkling-app-cli build --copy` (copied into native asset dirs).
- Backend prod: `npm run start:prod -w backend` (runs `node dist/main` after build).
- Do not add Docker/CI Node images that are not 24.x without an explicit request.

## Pull Request Guidelines

- Title: short, imperative, scoped
- Before claiming done: `nvm use 24.20.0`, then lint / typecheck / tests for the workspaces you changed (`type-check` for Vue, `oxlint` + Vitest for Nest, `vitest` for Lynx). Run `npm run build -w <workspace>` if routes, Nest modules, or Lynx/rspeedy config changed.
- Vue UI/runtime claims: verify in the browser (or state that browser tools were unavailable).
- Lynx UI/runtime claims: use `lynx-devtool` when a device/session is available, or state that it was blocked.
- Do not commit `.env*`, `dist/`, `coverage/`, or `node_modules/`
- Do not expand scope into `.agents/skills` unless the task is about skills

## Additional Notes

- Default Homebrew `node` on PATH may be **not** 24. Always activate nvm 24.20.0 in the same shell as npm.
- Skills live under `.agents/skills/`. Do not edit them unless the task is about the skills themselves.
- Trellis skills live under `.cursor/skills/` (and `.claude/skills/`). Follow `.trellis/workflow.md` when a Trellis task is active.

<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->
