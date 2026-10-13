# LIFT — product plan for this fork

LIFT is Kassra's App Store build of openGym. This repo is a public fork of
[DuarteSantos8/openGym](https://github.com/DuarteSantos8/openGym) under AGPL-3.0, shipped to the App Store
under openGym's app-store exception (NOTICE.md), so **the source stays public here**. Never commit secrets,
personal data, or the private `DaneHouse/lift-cleanroom` code.

## Decisions (locked 2026-10-09)

- **Start from openGym's mobile flavor** (`VITE_MOBILE=1`, Capacitor). It already works fully on-device with
  no server. Keep that working at every step; it is the offline core.
- **Backend = Supabase from day one.** Replaces the "connect to a self-hosted server" mode for the App Store build.
  - **Auth:** Supabase Auth with Sign in with Apple (required on iOS) and email magic link. Passkeys/pairing stay
    for self-hosters but are hidden in the LIFT build.
  - **Data:** phase 1 mirrors openGym's existing whole-state sync (`GET/PUT /api/data` with a `rev`) into one table:
    `user_state(user_id uuid pk references auth.users, data jsonb, rev bigint, updated_at timestamptz)` with RLS
    `user_id = auth.uid()`, and an RPC `put_state(data, expected_rev)` that rejects stale writes exactly like the
    server does. Normalised tables can come later; do not block on them.
  - **Media (progress photos):** Supabase Storage bucket `media`, path `<user_id>/<hash>`, RLS by folder.
  - **Coach:** Supabase Edge Function that runs the existing prompts (`api/coach/prompts`, built to
    `api/coach/core/prompts.js`) against the Anthropic API with the operator key stored as a function secret,
    per-user daily limits, schema validation. The app never holds the key.
  - **Account deletion:** in-app, via an Edge Function that deletes the auth user and all rows/files (Apple requirement).
  - Schema, RLS and functions live in `supabase/` (migrations + functions) so they are reviewable in the repo.
- **Payments:** RevenueCat later (Pro = coach, sync, health connectors). Not in this phase.
- **iOS builds:** Capacitor `frontend/ios`, built on GitHub Actions macOS runners (free for this public repo) and
  uploaded to TestFlight with an App Store Connect API key stored in GitHub secrets. Bundle id `com.danehouse.lift`,
  App Store Connect app id `6821132633`. Display name "LIFT" (placeholder until naming).
- **Look:** minimalist monochrome (true black / white, colour only where it carries meaning). Kassra's gym notes are the
  feature list below.

## Feature list (Kassra's gym notes)

1. Minimalist monochrome theme.
2. Rest-end cue: chime, haptic, original voice line, or the user's own clip; ducks or pauses music, then resumes. No
   celebrity voices.
3. Dynamic Island / Live Activity rest timer.
4. Visible progressive overload: every target says why ("hit 3x8 last time, +5 lb").
5. Tap plates to build the barbell weight; reverse view for a target weight.
6. PT / injuries integrated into workouts (coach PT layer already in `api/coach/prompts/common.md`).
7. More volume per session in templates and coach plans.
8. Social links and the user's own screenshots on exercises.
9. Apple Health read/write; Garmin via the official Health API only (later).

## Before App Store submission (not before TestFlight)

- Exercise GIFs/images: the bundled media come from ExerciseDB via a redistributed dataset with unclear rights
  (NOTICE.md). Replace or license before public release. Fine for private TestFlight.
- Privacy policy, nutrition labels (health data), review notes, screenshots.

## Phases (agreed 2026-10-13)

Each phase ends with a gate Kassra signs off. Done items are marked ✓.

### Phase 1 — The lift (foundation)
- ✓ iOS pipeline to TestFlight, monochrome theme, LIFT name, muscle map + "Watch how"
- ✓ Live Activity / Dynamic Island rest timer, end-of-rest notification, "Up next" in the rest bar,
  next exercise opens after the last set
- Onboarding, one question per screen: units, goal, experience, days/week, session length, gym, injuries,
  starting weights (or "find them in session 1") → builds the plan. Settings → Redo onboarding (keeps history)
- Gym-aware: pick a chain or setup (24 Hour Fitness, LA Fitness, Planet Fitness, Equinox, home, hotel) →
  preset equipment; edit machines per gym; "Machine taken" one-tap swap that keeps progression
- Progressive overload made visible: defaults (linear compounds, double accessories, high-rep rehab),
  a why-line on every target, auto deloads, PR history per lift
- Rest-end cue that ducks music; finished-workout screen (Kassra's idea)
- **Gate G1:** Kassra trains two weeks on it with no blocker

### Phase 2 — Accounts + coach
- Supabase: Sign in with Apple + email, sync, in-app account deletion
- Coach Edge Function (Claude, operator key): plan from onboarding, weekly review, session debrief, PT layer
- Injuries screen: stage, rehab block at the top of sessions, check-in swaps, refer-out
- **Gate G2:** friends on TestFlight via the public link

### Phase 3 — Launch v1.0
- RevenueCat Pro (coach, sync, health) + paywall; pricing (Kassra)
- Name + icon (Kassra), exercise media decision (Gym visual license or "Watch how")
- Privacy policy, App Store listing, screenshots, review notes
- **Gate G3:** Kassra presses Submit

### Phase 4 — Health layer (1.x updates)
- Apple Health read/write + Apple Watch data; Garmin (official Health API, application needed); WHOOP; Oura
- One readiness read that adjusts today's lift (cap the top set, trim volume, or push)
- Cardio presets logged beside lifts: zone 2, intervals, run, bike, row, incline walk, stairs

### Phase 5 — Nutrition
- Photo + barcode logging, macros set from the training goal (cut / maintain / bulk), protein focus

### Phase 6 — Lifestyle + Watch
- Habits: daylight (Watch time-in-daylight), steps, sleep timing, optional custom habits (e.g. grounding),
  no health claims
- Apple Watch app for logging sets

## Product direction (Kassra, 2026-10-13)

LIFT is a **lift-first health app**: the daily lift is the centre, everything else feeds it.

- **Foundation (now):** tracker + progressive overload (linear for compounds, double for accessories,
  high-rep double for rehab; every target says why; auto deloads), guided onboarding that builds the plan,
  gym-aware plans (pick your gym/chain → preset equipment; "machine taken" one-tap swap that keeps
  progression), coach with the PT layer, gym-floor polish (Live Activity, Up next, Watch how, music-ducking cue).
- **Health layer (next):** Apple Health / Apple Watch, Garmin (official Health API), WHOOP, Oura → one readiness
  read that adjusts today's lift; cardio presets (zone 2, intervals, run, bike, row, incline walk, stairs).
- **Nutrition (after):** photo / barcode logging with macros tied to the training goal.
- **Lifestyle habits (after):** daylight (Apple Watch time-in-daylight), steps, sleep timing, optional habits
  (e.g. grounding) logged without health claims.
- Competitors already aggregating health: Bevel (recovery/strain/sleep/nutrition/strength, Apple Health),
  Vora (free, 500+ wearables, photo food), CARMA. LIFT wins on: lift-first, coach + PT, gym-aware, floor UX.
- Retention through value, not friction: Apple owns cancellation; no dark patterns.
