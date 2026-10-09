# LIFT — Product & Build Spec (v1)

Codename **LIFT** (real name + icon = Kassra's decision, Gate G1). Owner: Kassra Daneshmir. Proprietary, closed source.

## 1. What it is

A minimalist iPhone-first strength-training app with a built-in **AI coach that is also your physical therapist**. It plans your training, runs your session at the gym, progresses weight and reps for you, and rebuilds you around injuries. Live Apple Health, Health Connect and Garmin data feed recovery into every decision.

Who: Kassra and his friends first (TestFlight), then the App Store. Money: free core tracker, paid **Pro** subscription.

## 2. Product principles

1. **The gym screen is the product.** One-handed, glanceable, zero typing during a set.
2. **Minimalist.** Monochrome: true black (#000) / white in dark, inverse in light. Accent = white (dark) / black (light). Colour only where it carries meaning (PR, missed set, injury flag), muted. Generous whitespace, no card borders/shadows/emoji clutter, tabular numerals for weights/reps/timers. SF Pro via system font.
3. **Every number explains itself.** Each target weight/rep shows a one-line why ("Hit 3x8 last time → +5 lb").
4. **Injuries are first-class**, not a notes field.
5. **Offline at the gym.** Everything in a session works with no signal; sync later.
6. **Nothing creepy.** Health data never leaves the device except to the user's own account; AI only gets what the consent screen lists.

## 3. Feature set

### 3.1 Training core (Free)
- **Exercise library**: ~1,300 exercises (names, primary/secondary muscles, equipment, instructions) from the MIT-licensed dataset `hasaneyldrm/exercises-dataset` (metadata + instructions ONLY — never its images/GIFs). Attribution in Settings → Acknowledgements. Search, filter by muscle (tap a body map), equipment, favourites. Custom exercises.
- **Body map**: front/back SVG muscle map, built from the MIT-licensed `melihcolpan/MuscleMap` path data (attribute it), or drawn fresh.
- **Exercise references**: attach the user's own Instagram/TikTok/YouTube link (shown as a card with Open Graph thumbnail when available) and/or their own screenshot/photo/video to any exercise. Strip location metadata on device. Never scrape or rehost third-party video.
- **Plans**: routines (exercises, sets, rep targets or rep ranges, timed holds, cardio), scheduled by weekday OR as a rotation (next session = next undone). Supersets, warm-up sets, drop sets, per-exercise rest.
- **Starter templates**, full volume (6–8 exercises incl. a core/rehab slot): PPL 6-day, PPL 3-day, Upper/Lower 4-day, Full Body 3-day, 5x5. Session-length preference (45/60/75/90 min) trims or adds accessory volume.
- **Guided session**: today's workout auto-loads; target pre-filled; tap ✓ to log a set as prescribed or adjust with steppers; rest timer auto-starts; PRs detected live; effort per set (RIR) optional; screen stays awake; session notes.
- **Plate builder**: on barbell / plate-loaded lifts, tap plates (lb: 45/35/25/10/5/2.5; kg: 25/20/15/10/5/2.5/1.25) to add per side; bar type (Olympic 45/20, EZ, trap, Smith, custom) sets the base; total is computed. Reverse view shows the plates for any target weight from the user's plate inventory.
- **History & stats**: calendar heatmap, per-exercise history, estimated 1RM curve, volume per muscle (body-map heat), body-weight chart with goal line, progress photos.
- **Imports**: CSV from Strong / Hevy / FitNotes; JSON export of everything.

### 3.2 Progressive overload engine (Free: linear + double; Pro: all)
Pure, deterministic functions of the workout log (no stored counters). Every policy returns `{ weight, reps, sets, reason }`.
- **Linear**: all sets hit → +increment; else hold; 3 consecutive misses → deload 10%.
- **Double progression**: climb reps inside a range; at top of range on all sets → +weight, reset to bottom.
- **RIR-autoregulated**: top-set load moves with logged RIR vs target RIR.
- **Top set + back-offs**: one heavy top set, back-offs at -10–15%.
- **5/3/1-style wave**: training max, weekly 5s/3s/5-3-1/deload.
- **Time**: holds add seconds.
- Deload weeks, per-exercise increments (lb/kg), bodyweight exercises progress reps then sets.
- Defaults that work out of the box: compounds = linear, accessories = double (8–12), rehab = double high-rep or time.

### 3.3 PT / Injuries (Pro; one injury free)
- **Injuries screen**: add injury (body area, side, date, description, current stage: Protect → Restore → Rebuild → Return).
- **Rehab block**: each active injury auto-inserts a 2–3 exercise rehab warm-up (~8–10 min) at the top of sessions that train or load that area. Curated per-area menus by stage (ankle/calf/Achilles, knee, hip, low back, shoulder, elbow/wrist, neck) mapped to library exercise ids, written fresh by us.
- **Pre-session check-in**: "Ankle 1–5?" for each relevant injury. Score < 3 → flagged lifts are swapped for a safe variation (machine/seated/supported/opposite-limb) with a one-line why; < 2 → area is protect-only today.
- **Graduation from the log**: suggest moving up a stage after ≥2 weeks of completed rehab at easy effort and check-ins ≥4; move back on pain reports or skipped rehab. User confirms.
- **Red flags → refer out**: swelling that won't settle, numbness, giving way, night pain, worsening week to week → stop loading the area, recommend a physio/doctor. Never diagnose. Disclaimer: not medical advice.

### 3.4 AI Coach (Pro)
- **Intake** (one question per screen): goal, experience, days/week, session length, equipment/gym, injuries (pulled from Injuries), likes/dislikes.
- **Plan design**: generates a full program as structured JSON referencing only library exercise ids; user reviews a diff and applies.
- **Weekly review**: reads the log (stalls, missed sessions, effort trend, body-weight trend, recovery data) and proposes changes, each with an evidence-cited reason; user approves per change.
- **Session debrief**: score /10, what went well, what to watch, next-time targets.
- **Chat**: "make Thursday shorter", "my knee hurts on squats" → proposals, never silent changes.
- **Voice**: strict, terse performance coach. Observation → decision → next action. No cheerleading, no padding.
- **PT layer** is part of the coach's rules (stages, rehab block, graduation, refer-out).
- Server-side only (Supabase Edge Function) with the operator's Anthropic API key; per-user daily limits; schema-validated output with one repair retry; prompt caching on the static system prompt. Use the current Claude model IDs (verify via Anthropic docs at build time; a Sonnet-class model for plans/reviews, a Haiku-class model for debriefs/chat).

### 3.5 Health connectors (Pro)
- **Apple Health (HealthKit)**: read body mass, sleep, resting HR, HRV, steps, active energy, workouts; write completed strength sessions as workouts (traditional strength training) with duration/energy. Background delivery where allowed; sync on foreground.
- **Health Connect (Android)**: same set (Android later; keep the abstraction).
- **Garmin**: Garmin Connect Developer Program (Health API: dailies, sleep, body battery, stress, body comp, activities) via OAuth + webhooks on the backend. Requires Garmin approval → build behind a feature flag; Kassra submits the application (Gate). Never use unofficial username/password libraries.
- **Recovery score**: simple, explainable daily readiness from sleep, HRV/RHR vs baseline, body battery; feeds coach + session intensity suggestions.

### 3.6 Gym-floor delight (Pro)
- **Live Activity / Dynamic Island**: rest countdown, current exercise + set, next target; controls to skip/add 30s.
- **Rest-end cue**: choose voice line (original recorded/TTS motivational lines in the app's strict voice — no celebrity voices or likenesses), the user's own uploaded clip, chime, or haptic only. Audio session ducks (or optionally pauses) the user's music, plays the cue, resumes.
- Apple Watch companion: later (post-launch).

### 3.7 Accounts, sync, money
- **Auth**: Sign in with Apple (required), email magic link. Account deletion in-app (App Store requirement).
- **Local-first**: SQLite on device is the source during sessions; background sync to Supabase Postgres (row-level security per user; last-writer-wins per field with updated_at; soft deletes).
- **Pro via RevenueCat**: monthly + annual + free trial; paywall after the first completed workout and on Pro-feature taps. Friends get promo codes / an entitlement override. Pricing = Kassra's decision (Gate G5).

### 3.8 Daily routines (Free core; v1)
- **Morning wake-up stretch** and **bedtime stretch**: short guided routines of timed holds, using the library's static stretches (logged as timed holds) and the injury rehab content.
- Anchored on the lifting: the routine adapts to today's session (stretch what you will train in the morning, what you trained at night) and to active injuries (rehab-safe options, skip flagged areas).
- Reminder times are the user's choice. Nothing is posted outside the device.
- **Built from today's lifting**: morning opens up what you will train; bedtime stretches what you trained; rest days get a general full-body routine; injured areas use gentle options.
- **Morning routine (about 6 minutes)**: a prompt to get daylight, mobility holds chosen from today's session, one minute of slow breathing. Evidence for lasting mood or alertness effects is modest, so the app makes no neurochemical claims. Bedtime routine is about 5 minutes of holds plus slow breathing.
- **Guided screen**: one stretch per screen, auto-advancing countdown with pause and skip, a short cue at the end of each hold.
- **Entry points**: a Stretch card on Today at the right time of day, an always-available home-screen widget (needs the native widget target, built with P3 after the first dev build), and optional notifications with user-set times (off by default).
- Open: exact routine length setting (5/10/15), widget contents, completion tracking.

## 4. Tech stack

- **App**: Expo (latest stable SDK, currently 57.x), React Native, TypeScript strict, Expo Router, EAS Build/Submit/Update. Dev client (native modules required).
- **State/data**: expo-sqlite + Drizzle ORM (local), Zustand for UI state, TanStack Query for server calls.
- **Native**: `@kingstinct/react-native-healthkit` (HealthKit), `react-native-health-connect` (Android), `react-native-purchases` (RevenueCat), `expo-audio` (ducking), Live Activities via `@bacons/apple-targets` (Swift widget target) + a small native module, `expo-keep-awake`, `expo-haptics`, `expo-image-picker`. Pin exact versions that are ≥2 weeks old.
- **Backend**: Supabase (Postgres + RLS, Auth, Storage for user media, Edge Functions for coach + Garmin webhooks + account deletion).
- **Quality**: Vitest/Jest for pure logic (progression, injuries, plates, sync merge, imports), React Native Testing Library for key screens, Maestro E2E for the session flow. ESLint + Prettier. CI on GitHub Actions.

## 5. Data model (sketch)

`profiles`, `exercises` (library, read-only, bundled) + `custom_exercises`, `exercise_refs` (url, og meta, media path), `routines`, `routine_items` (exercise_id, sets, reps, rep_min/max, seconds, policy, increment, rest, superset_group, order), `schedules` (weekday or rotation), `workouts`, `workout_sets` (weight, reps, seconds, rir, done, warmup, set_type), `bodyweight`, `injuries` (area, side, stage, started_at, status), `injury_checkins`, `health_daily` (date, sleep_min, rhr, hrv, steps, body_battery, source), `coach_threads`, `coach_proposals` (json, status), `settings`. All rows: `id uuid`, `user_id`, `updated_at`, `deleted_at`.

## 6. Exercise media policy

Launch with **no third-party exercise images/GIFs**: text instructions + muscle map + the user's own references. In parallel, a commissioned or original top-150 still-illustration set with a per-asset provenance ledger. A licensed pack (ExerciseDB/AscendAPI commercial or Gym visual, ~$1.2k list for 1,324 GIFs) only with written terms covering App Store, offline caching and hosted use — Kassra's decision (Gate G6).

## 7. Phases & gates

- **P0 — Foundation**: Expo app scaffold, design system (tokens, type, mono theme, core components), navigation (Today / Plan / History / Coach / Settings), SQLite schema + migrations, exercise library import script + bundled data, CI. **G1**: Kassra picks name + bundle id + icon direction.
- **P1 — Train**: plans, templates, guided session, rest timer, plate builder, progression engine (all policies), history/stats, body weight, imports/export. Dev build on Kassra's phone. **G2**: Kassra gym-tests it.
- **P2 — PT**: injuries, rehab menus, check-in + swaps, graduation, refer-out.
- **P3 — Native delight + Health**: Live Activity/Dynamic Island, rest cues with music ducking, HealthKit read/write, recovery score. **G3**: TestFlight internal.
- **P4 — Accounts & sync**: Supabase project, auth (Apple + email), RLS, sync engine, account deletion, media storage.
- **P5 — Coach**: edge functions, prompts (written fresh), schema validation, intake/plan/review/debrief/chat UI, limits, evals with fixtures (new lifter, ankle sprain, knee, shoulder, red-flag referral).
- **P6 — Money & launch**: RevenueCat products + paywall, App Store package (privacy policy, nutrition labels incl. health data, HealthKit purpose strings, screenshots, review notes, demo account), TestFlight external for friends. **G4**: Garmin application submitted by Kassra. **G5**: pricing. **G6**: media decision. **G7**: submit for App Store review (Kassra presses the button).
- **P7 — Android + Garmin** (post-launch unless Garmin approval lands early).
- **P8 — Nutrition (post-launch)**: food logging and macros anchored on training days. Open decisions before work starts: food database source and licence, barcode scanning, macro target method, how it feeds the coach and recovery score.

## 8. Non-goals for v1
Social feed, leaderboards, Apple Watch app, web app. Nutrition and macro tracking is deferred to P8, not dropped.
