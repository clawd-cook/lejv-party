# Component Guidelines

> How components are built in `apps/frontend-app` (ReactLynx / Sparkling).

---

## Overview

Pages under `src/pages/{main,home,room,second}/` use ReactLynx. Interactive controls come from `@lynx-js/lynx-ui`. Layout uses Lynx elements (`view`, `text`, `image`) plus Luna tokens — not HTML and not hand-rolled control skins.

---

## Component Structure

- Page entry: `index.tsx` calls `root.render(<App />)`.
- Screen UI: `App.tsx` (+ optional `components/` for room panels).
- Shared scheme helpers: `src/lib/room-params.ts`.
- Shared styles: `src/App.css` (Luna import + layout helpers); page `App.css` may re-export.

---

## Interactive controls (lynx-ui)

| Need | Use |
| --- | --- |
| Pressable action / lobby toggle | `Button` from `@lynx-js/lynx-ui` (`onClick`) |
| Text field | `Input` from `@lynx-js/lynx-ui` — prefer **uncontrolled** (`onInput` only; avoid `value=` unless required). Remount with `key` to clear. |
| Page scroll (no inputs) | `ScrollView` from `@lynx-js/lynx-ui` |
| Page scroll with inputs | `KeyboardAwareRoot` + `KeyboardAwareResponder as="ScrollView"` + wrap each field in `KeyboardAwareTrigger` |

Import from the aggregate package `@lynx-js/lynx-ui` unless a package-specific import is required by docs.

There is no lynx-ui Card / Chip / Typography. Cards and labels stay as `view` / `text` with Luna token CSS. Lobby multi/single selects use `Button` + selected `className` (not RadioGroup/Checkbox unless product asks).

Lynx `<text>` defaults to `white-space: nowrap` — set `white-space: normal` on any copy that must wrap (`.subtitle`, `.muted`, `.error`, `.quote__text`, …).

---

## Styling Patterns

1. Depend on `@lynx-js/luna-styles` and `@import '@lynx-js/luna-styles/index.css'` in shared CSS.
2. Page root: `className` includes `luna-light` (built-in theme for this app).
3. Surfaces/text/actions use tokens: `var(--canvas)`, `var(--paper)`, `var(--content)`, `var(--primary)`, `var(--line)`, etc.
4. No hex/rgb brand colors in shared CSS. Luna has no error/success tokens — map `.error` / `.countdown--warn` → `var(--primary)`, `.ok` → `var(--content-2)`.

`app.config.ts` ReactLynx plugin uses `enableNewGesture: true` for lynx-ui gesture-capable components.

---

## Cold start entry

Native cold start opens **`home.lynx.bundle`** (Android `SplashActivity`, iOS `SparklingSwiftVC` / `SparklingSwiftUIView`). `main` / `second` remain build entries as slim debug shells — not the production entry.

---

## Common Mistakes

- Hand-writing `bindtap` pseudo-buttons or native `<input>` as the primary control path.
- Restyling controls with brand hex gradients instead of Luna tokens.
- Pointing splash / launch URLs back at `main.lynx.bundle`.
- Assuming lynx-ui ships Card/Chip — it does not; compose with tokens.
- Calling `sparkling-navigation` `open({ scheme })` without a callback — it no-ops. Use `openScheme()` from `src/lib/navigation.ts`.
- Freezing route params with `useState(() => readRoomRouteParams())` — Sparkling may fill `queryItems` after first paint; read every render (reactive globalProps).
- Reading only top-level `__globalProps.roomId` — prefer `queryItems` (and nested `schemeParams.extra` / `initial_data`) via `readRoomRouteParams()`.
