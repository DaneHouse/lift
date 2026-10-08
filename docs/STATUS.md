# LIFT — Status & Next Steps

Read SPEC.md and AGENTS.md first (CLEAN-ROOM RULE applies). This file is the hand-off for any session (local, Claude Code on the web, Codex).

## Done (Runs 1–2, as of 2026-10-08)
- P0 foundation: Expo 57 + TS strict + Expo Router, mono design system, SQLite (expo-sqlite + Drizzle), bundled exercise library (MIT metadata only) + body map, CI.
- P1 train: plans/schedules (weekday + rotation), templates + session length, guided session (targets from the progression engine with why-line, rest timer from stored end timestamp, PRs, RIR, keep-awake), plate builder (tap + reverse, bar types, lb/kg, persisted inventory), history/stats (heatmap, e1RM, muscle volume, bodyweight + goal), CSV import (Strong/Hevy/FitNotes) + JSON export, library UI + custom exercises + favourites, exercise reference links, swap/add/reorder/skip mid-session.
- `npm run verify` green (85 tests). `.npmrc` uses legacy-peer-deps (react-native-worklets peer range).

## Decisions (Kassra / defaults)
- App name + bundle id: decided LAST. Keep placeholder `com.placeholder.lift` behind the one config constant.
- Skipped exercises do not count as a miss.
- Expose all progression policies in the plan editor.
- kg bars: Olympic 20 kg, EZ 10 kg, trap 25 kg; lb: 45 / 25 / 55.
- Rest stays per plan item with a global default.
- Builds go through EAS cloud (Kassra's Mac is out of disk). No local Xcode builds required.

## Next run (Run 3)
1. Plan editor: expose RIR-autoregulated, top set + back-offs, 5/3/1 wave, bodyweight policies; deload weeks.
2. Replace the name-based timed-exercise heuristic with an explicit mode on library/custom exercises.
3. EAS setup: `eas.json` with `development` (dev client, internal distribution), `preview`, `production` profiles; docs/EAS_BUILD.md with the exact commands Kassra runs (`npx eas-cli login`, `eas build --profile development --platform ios`, device registration via `eas device:create`).
4. P2 PT/Injuries per SPEC §3.3 (injury CRUD, stage, per-area rehab menus written fresh, auto rehab block, pre-session 1–5 check-in with swaps, graduation suggestions, red-flag refer-out, disclaimer).
5. Then P3 (Live Activity, rest cues with music ducking, HealthKit, recovery score) — needs native modules + EAS dev build.

## Gates waiting on Kassra
G1 name/bundle id (last) · G2 gym-test dev build · G4 Garmin application · G5 pricing · G6 exercise media · G7 App Store submit.
