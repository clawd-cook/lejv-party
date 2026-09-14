# Implement: lynx-ui adopt + home cold start

## Checklist

1. [ ] Install `@lynx-js/luna-styles` at repo root (`nvm use 24.20.0` + `npm install -w frontend-app` or workspace-compatible add).
2. [ ] Add shared Luna CSS import + layout token helpers; wire `luna-light` on page roots.
3. [ ] Confirm / set `enableNewGesture` in `app.config.ts` if required by ScrollView/Input.
4. [ ] Migrate `home` → `ScrollView` + `Input` + `Button`; delete obsolete control CSS.
5. [ ] Migrate `room` shell + `LobbyPanel` / `QuestionPanel` / `RevealPanel` / `EndedPanel` / `Leaderboard` (Lobby chips → Button toggles).
6. [ ] Slim `main` + `second` to lynx-ui placeholders; drop home CTA as primary path.
7. [ ] Android `SplashActivity` → `home.lynx.bundle`; iOS launch URLs → `home.lynx.bundle`.
8. [ ] Update Vitest as needed; run `npm run test -w frontend-app` and `npm run build -w frontend-app`.

## Validation commands

```bash
export NVM_DIR="$HOME/.nvm"
. "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 24.20.0
node -v   # v24.20.0
which node

npm run test -w frontend-app
npm run build -w frontend-app
```

Manual (device/simulator if available): cold start lands on create/join home; create room still opens room scheme.

## Risky files / rollback points

- `apps/frontend-app/android/.../SplashActivity.kt`
- `apps/frontend-app/ios/SparklingGo/SparklingGo/SparklingSwiftVC.swift`
- `apps/frontend-app/ios/SparklingGo/SparklingGo/SparklingSwiftUIView.swift`
- Shared `App.css` / new luna stylesheet (wide visual blast radius)
- `LobbyPanel.tsx` (config toggle correctness)

Rollback: git revert the UI + native scheme commits; keep API untouched.

## Review gate before `task.py start`

- [ ] User reviewed `prd.md` / `design.md` / `implement.md`
- [ ] `implement.jsonl` / `check.jsonl` have real spec entries (not seed-only)
