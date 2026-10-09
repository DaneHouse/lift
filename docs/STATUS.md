# LIFT — Status & Next Steps

Read SPEC.md and AGENTS.md first (CLEAN-ROOM RULE applies). This file is the hand-off for any session (local, Claude Code on the web, Codex).

## Done (Runs 1–3, as of 2026-10-09)

- P0 foundation: Expo 57 + TS strict + Expo Router, mono design system, SQLite (expo-sqlite + Drizzle), bundled exercise library (MIT metadata only) + body map, CI.
- P1 train: plans/schedules (weekday + rotation), templates + session length, guided session (targets from the progression engine with why-line, rest timer from stored end timestamp, PRs, RIR, keep-awake), plate builder, history/stats, CSV import + JSON export, library UI + custom exercises + favourites, exercise reference links, swap/add/reorder/skip mid-session.
- Run 3:
  - Plan editor exposes all policies: linear, double, RIR, top set + back-offs, 5/3/1 wave, bodyweight, time. Per-item deload cadence (every N weeks). Migration 003.
  - Explicit exercise mode (reps / time / cardio) on every library entry (curated in `scripts/exercise-modes.ts`) and on template items. Name heuristic removed. Migration 004 fixes template holds stored earlier.
  - EAS: `eas.json` (development / preview / production, no submit config) and `docs/EAS_BUILD.md`.
  - P2 PT/Injuries (SPEC 3.3): injury CRUD with stage, rehab menus for 7 areas x 4 stages, auto rehab block at the top of sessions that load the area, 1-5 check-in before such sessions (under 3 swaps, under 2 protect-only), graduation suggestions (user confirms), red flags that stop loading the area and say to see a physio or doctor, disclaimer. Migration 005.
- `npm run verify` green (131 tests). iOS bundle exports. `.npmrc` uses legacy-peer-deps (react-native-worklets peer range).

## Decisions (Kassra / defaults)

- App name + bundle id: decided LAST. Keep placeholder `com.placeholder.lift` behind the one config constant.
- Skipped exercises do not count as a miss.
- Expose all progression policies in the plan editor.
- kg bars: Olympic 20 kg, EZ 10 kg, trap 25 kg; lb: 45 / 25 / 55.
- Rest stays per plan item with a global default.
- Builds go through EAS cloud (Kassra's Mac is out of disk). No local Xcode builds required.

## Decisions made in Run 3 (defaults, change if you disagree)

- Deload weeks are counted from an exercise's first logged session. Sessions logged in a deload week do not move the target. 5/3/1 week is the number of logged sessions mod 4, and the training max rises by one increment per cycle.
- Static stretches (50) are logged as timed holds, as are planks and carries. Dynamic or loaded stretches stay on reps.
- Rehab items missing from the library (clamshell, wall sit, chin tuck and a few more) are created as custom exercises.
- Check-in swaps use a fixed table of machine / seated / supported variations. If none fits, the lift is skipped for the day with a reason.
- Pro gating (one injury free) is not enforced yet. It belongs with the paywall in P6.
- Not yet tried on a device. Run through Injuries, check-in and a rehab session in the dev build.

## Next run (Run 4)

1. P3 needs native modules and an EAS dev build first: Live Activity / Dynamic Island, rest cues with music ducking (`expo-audio`), HealthKit read/write (`@kingstinct/react-native-healthkit`), recovery score. Start with the pure recovery-score function and tests, then the HealthKit abstraction behind an interface, then native wiring.
2. Device pass on Run 3 features once Kassra has a dev build (G2).
3. Injuries polish: left/right opposite-limb swaps, rehab history view, check-in trend chart.

## Gates waiting on Kassra

G1 name/bundle id (last) · G2 gym-test dev build · G4 Garmin application · G5 pricing · G6 exercise media · G7 App Store submit.
