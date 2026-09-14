# Quality Guidelines

> Code quality standards for `apps/frontend-app`.

---

## Overview

Prefer lynx-ui + Luna tokens over custom control CSS. Keep room/API behavior behind `@lejv-party/api-client` / `client-core`; UI rewrites must not change scheme keys or SSE transport without updating the cross-layer contract.

---

## Forbidden Patterns

- Primary CTAs as `<view bindtap>` styled to look like buttons.
- Primary text entry via Lynx `<input bindinput>` when `Input` from lynx-ui is available.
- Teal/red (or other brand) gradient / hex control skins that bypass Luna tokens (including ad-hoc `#c1121f` / `#0f7a4a` status colors).
- Changing cold-start bundle away from `home.lynx.bundle` without an explicit product decision.
- Introducing Tailwind / a second CSS framework without an explicit request.

---

## Required Patterns

- Interactive controls: `@lynx-js/lynx-ui` (`Button`, `Input`, `ScrollView`, …).
- Theme: `luna-light` on page roots; `@lynx-js/luna-styles` imported once in shared CSS; colors via tokens only (status: error/warn → `--primary`, ok → `--content-2`).
- Lobby filters: `Button` selected toggles; eras/genres keep at-least-one selection rules.
- Room SSE: `subscribeRoomEvents(..., { transport: 'fetch' })` unless the room API contract changes.
- Node for scripts: nvm **v24.20.0** only (see root `AGENTS.md`).

---

## Testing Requirements

- Run `npm run test -w frontend-app` and `npm run build -w frontend-app` after UI/entry changes.
- Vitest may mock `@lynx-js/lynx-ui` when real `Input` hits unimplemented native `setValue` in the Lynx test env (`src/test/setup-lynx-ui-mock.tsx`). Smoke tests must still assert key labels / mount behavior.
- iOS unit-test fixtures that mention `main.lynx.bundle` as sample scheme URLs are not the app cold-start path.

---

## Code Review Checklist

- [ ] No new hand-rolled primary buttons/inputs.
- [ ] `luna-light` + tokens on touched screens.
- [ ] Cold start still targets `home` if native launch files changed.
- [ ] Room create/join/config/answer behavior and scheme params unchanged unless contracted.
- [ ] Tests + build green on Node 24.20.0.
