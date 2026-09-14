# Design: lynx-ui adopt + home cold start

## Boundaries

| In | Out |
| --- | --- |
| `apps/frontend-app` Lynx 页面 UI、共享样式、原生冷启动 scheme | API / domain / backend |
| 新增 `@lynx-js/luna-styles` 依赖与 theme 接入 | Tailwind / 自定义 Luna 主题 |
| `SplashActivity` + iOS 启动 URL → `home` | 删除 `main`/`second` 路由或改 Sparkling 测试夹具 URL（除非测试断言启动路径） |

## Architecture

```
Cold start (native scheme)
  → home.lynx.bundle  (luna-light root)
       → create/join (Input + Button + ScrollView)
       → router.open(room scheme)
            → room.lynx.bundle panels
main / second remain build entries as slim debug shells
```

### Theme

- Add dependency `@lynx-js/luna-styles` (workspace install from repo root).
- Shared CSS entry (e.g. `src/styles/luna.css` or slim `src/App.css`):
  - `@import '@lynx-js/luna-styles/index.css';`
  - layout helpers only (page padding, stack, card shell using `var(--paper)`, `var(--line)`, `var(--content)`, …).
- Each page root: `className` includes `luna-light` (and canvas background via token).

### Component mapping

| Current | Replacement |
| --- | --- |
| `<scroll-view>` | `ScrollView` from `@lynx-js/lynx-ui` |
| `<input bindinput>` | `Input` (`onChange` / value API per `api.md`) |
| `view.primary` / `view.secondary` + `bindtap` | `Button` + `onClick`; children render-prop for `active` if needed |
| Lobby `Chip` | `Button` + selected/unselected token classes |
| Card / hero / labels | `<view>` / `<text>` + token CSS (no lynx-ui Card) |

Import from `@lynx-js/lynx-ui` aggregate package only.

### Native launch

- Android: `SplashActivity.kt` scheme `bundle=home.lynx.bundle` (keep `hide_nav_bar` / orientation flags; set a sensible title if needed).
- iOS: `SparklingSwiftVC.swift` / `SparklingSwiftUIView.swift` launch URLs → `home.lynx.bundle` (match existing `hybrid://lynxview` vs `lynxview_page` convention per file; do not blindly unify schemes).
- Leave iOS unit-test sample URLs that use `main.lynx.bundle` as fixtures unless they assert app entry.

### `main` / `second`

- Keep `app.config.ts` entries.
- Rewrite UI to minimal lynx-ui shell (title text + optional Button to open second).
- Remove Sparkling marketing hero / home CTA as primary path.

### ReactLynx config

- If ScrollView / Input gesture behavior requires it, set `pluginReactLynx({ enableNewGesture: true })` in `app.config.ts` (per lynx-ui foundation). Verify against current plugin defaults before changing.

### Tests

- Update queries if copy/structure changes; keep coverage of home create/join labels and room mount smoke tests.
- Mock boundaries unchanged (`sparkling-navigation`, `api-client`, `client-core`).

## Trade-offs

- **Button is unstyled skeleton** → still need token-based CSS for press/selected look; this is accepted Luna pattern, not a return to hex brand skins.
- **No Chip** → Button toggles may look larger than chips; acceptable for MVP consistency.
- **Keep main/second** → slightly larger bundle surface; avoids native path churn.

## Rollback

- Revert UI + CSS + `luna-styles` dep; restore native schemes to `main.lynx.bundle`.
