# Injuries and PT: design spec (agreed with Kassra, 2026-10-09)

Extends SPEC.md section 3.3. Nothing here is built yet. The Run 3 build (simple form, 1-5 check-in, 7 areas) is the starting point and will be reworked to match this.

Principle: injuries are first-class, but nothing may add friction to starting a workout.

## 1. Adding an injury (guided, one question per screen)

1. Where: tap the front/back body map to pick the exact muscle or joint (e.g. left hamstring, right Achilles). The app groups the spot into a broader region that drives rehab menus and which lifts are flagged. Fallback list for people who prefer not to use the map.
2. Side: left, right, both, centre (skipped when the map tap already implies a side).
3. How it started: sudden (a specific moment) or gradual, plus a date.
4. Pain now, 0 to 10 (the baseline for the log).
5. What makes it worse: tap movements (squat, overhead, running, gripping, and so on). Used to flag lifts, not just muscles.
6. Seen a clinician or diagnosed: optional free text. Shown in the log. LIFT never diagnoses.
7. Starting stage: suggested from pain and how long ago it started; the user can change it.

Open: the exact region list and the spot-to-region map (needs research).

## 2. Pre-session check-in

- Shown only before a session that loads an injured area.
- One tap per injury: 1 to 5 "how does it feel".
- 4 or 5: the session starts immediately.
- 3 or lower: follow-ups open (where it hurts, red-flag question, preview of what changes in the session). Under 3 flagged lifts are swapped; under 2 the area is protect-only today.
- A "Skip check-in" is always available.

## 3. Rehab inside a session

- A warm-up block of 2 to 3 exercises at the top, only on sessions that load the area.
- One "Skip rehab today" button. Skips are logged because they feed stage changes.
- Rehab-only days and a cool-down split are out of scope for now.

## 4. Injuries log

- A timeline per injury: injury added, each stage change, check-ins, rehab done or skipped, red-flag events.
- No chart, free-text notes or clinician export for now.

## 5. Stage changes (algorithm)

Stages: Protect, Restore, Rebuild, Return. The user always confirms a change.

Move up when all three are true:

1. Minimum time in stage has passed: Protect 3 days, Restore 10, Rebuild 14, Return 14.
2. The last 3 check-ins were 4 or 5.
3. At least 75% of rehab sessions in the last 2 weeks were completed.

Move back when either is true: any check-in of 2 or lower, or 2 skipped rehab sessions in a row.

The screen shows the three checks as ticks, e.g. "✓ 10+ days ✓ last 3 check-ins 4+ ✗ rehab 60% (needs 75%)". Numbers are tunable constants.

## 6. Red flags and referral

- The five red-flag questions (swelling that will not settle, numbness or tingling, giving way or locking, pain at night or at rest, getting worse week to week) are asked only when a check-in is 3 or lower.
- A "Something feels wrong" button on the injury screen is always available.
- A yes stops loading that area, shows a see-a-physio-or-doctor message, and the area stays on hold until the user taps "I have had it checked".
- Disclaimer on the injury and check-in screens: not medical advice.

## 7. Research still to do

Rehab menus and the swap table, per region and stage, with sources recorded in the repo. Region list and spot-to-region map. Cover the common conditions (ankle sprain, Achilles tendinopathy, patellofemoral pain, hamstring strain, groin strain, low back strain, rotator cuff irritation, tennis and golfer's elbow, wrist, neck strain). Content is written fresh (clean-room rule).
