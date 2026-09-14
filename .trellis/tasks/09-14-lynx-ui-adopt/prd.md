# Adopt lynx-ui across frontend-app

## Goal

`apps/frontend-app` 全量改用原生 `@lynx-js/lynx-ui` 交互组件与 **`luna-light`** tokens；冷启动原生 scheme 直达派对落地页 `home`，不再经 Sparkling starter 中转。

## Background

- 依赖已有 `@lynx-js/lynx-ui@^3.138.0`，源码零引用；UI 为手写 `<view>` / `<text>` / `<input>` + 多份 `App.css`（含青绿–红渐变）。
- 入口：`main` / `second` / `home` / `room`。Android `SplashActivity` 与 iOS 启动 URL 当前打开 `main.lynx.bundle`。
- `home` = 创建/加入房间落地页。lynx-ui **无** Card / Tag / Chip / Typography；`Button` 为行为骨架（需配合 Luna token 样式），非独立视觉皮肤包。
- 业务契约见 `.trellis/spec/guides/room-party-api-contract.md`（本任务不改 API）。

## Requirements

1. **全量 lynx-ui**：`home`、`room`（Lobby / Question / Reveal / Ended / Leaderboard）、`main`、`second` 的可交互控件改用 `@lynx-js/lynx-ui`（`Button` / `Input` / `ScrollView` 等）；布局用 `<view>` / `<text>` + Luna tokens。
2. **主题**：接入 `@lynx-js/luna-styles`，根节点使用 **`luna-light`**；表面/文字/主色走 token（`canvas` / `paper` / `content` / `primary` 等），不保留旧渐变手写皮肤与控件级 hex 皮肤。
3. **入口直达落地页**：Android `SplashActivity` 与 iOS 启动 URL（`SparklingSwiftVC` / `SparklingSwiftUIView`）改为 `home.lynx.bundle`；不在 JS 里二次 `router.open` 跳转。
4. **`main` / `second`**：保留 `app.config` 入口与 bundle，瘦身为最小 lynx-ui 占位（说明 + 可选打开 second 的调试按钮）；`main` 不再作为冷启动主路径，不保留「进入首页」主 CTA。
5. **Lobby 筛选**：CEFR / 年代 / 曲风 / 胜利分用 **`Button` 选中切换**（`className` + token 区分选中态）；年代/曲风多选仍至少保留 1 项。
6. **行为不变**：创建/加入、房间阶段、scheme 进 `room`、配置/开始/答题等业务逻辑不变。
7. **测试**：现有 Vitest 随组件替换更新并通过。

## Out of scope

- 后端 / `api-client` / domain 契约变更。
- Tailwind / `@lynx-js/luna-tailwind`（除非实现中发现 token CSS 不可用再回退评估）。
- 自定义 Luna 主题或复刻旧渐变品牌皮。
- Lobby 改用 `RadioGroup` / `Checkbox`。
- 从原生工程删除 `main` / `second` 路由。
- `09-14-prod-backend-url` 任务内容。

## Acceptance Criteria

- [ ] AC1：`home` / `room` / `main` / `second` 主路径交互控件来自 `@lynx-js/lynx-ui`，无手写 `bindtap` 伪按钮 / 原生 `<input>` 作为主输入路径。
- [ ] AC2：页面启用 `luna-light` + Luna tokens；控件级自定义 hex 皮肤（旧 primary/input/chip 等）已移除或等价替换为 token。
- [ ] AC3：Android / iOS 冷启动 scheme 指向 `home.lynx.bundle`，无需中转点击即可见落地页。
- [ ] AC4：Lobby 筛选为 `Button` 切换，多选约束（至少 1 个 era/genre）行为保持。
- [ ] AC5：`npm run test -w frontend-app` 通过；`npm run build -w frontend-app` 成功。
