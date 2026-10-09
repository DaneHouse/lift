# Injury regions, tap spots and aggravating movements

Part A1 of the injuries research (see docs/INJURIES_SPEC.md). Written fresh for LIFT from general anatomy. Clinical content (conditions, rehab progressions, red flags per region) is part A2 and will cite sources.

## Finding: the body map needs rebuilding

`src/components/BodyMap.tsx` has 8 coarse blocks (shoulders, chest, back, arms, core, glutes, upper legs, lower legs). It cannot separate hamstring from quad, and it has no joints (neck, elbow, wrist, knee, ankle). Tap-to-pick needs a finer front and back figure with about 30 tappable spots. Options: draw it fresh, or use the MIT-licensed MuscleMap paths (allowed by AGENTS.md, attribution in ACKNOWLEDGEMENTS.md). The same map also improves the library's muscle filter.

## Regions (16)

Each region has its own rehab menus and aggravating movements. Regions replace the 7 areas in `src/domain/injuries.ts`.

| Region id    | Label                   | Spots that map to it (tap targets)                                    |
| ------------ | ----------------------- | --------------------------------------------------------------------- |
| `neck`       | Neck                    | neck front, neck back, upper trapezius                                |
| `shoulder`   | Shoulder                | front delt, side delt, rear delt, shoulder joint, rotator cuff (back) |
| `chest`      | Chest                   | pectoral, sternum / rib front                                         |
| `upper-back` | Upper back              | mid back, lats, shoulder blade                                        |
| `low-back`   | Low back                | lower back (left / right / centre), sacrum                            |
| `core`       | Abs / core              | abdominals, obliques                                                  |
| `upper-arm`  | Upper arm               | biceps, triceps                                                       |
| `elbow`      | Elbow                   | outer elbow, inner elbow, back of elbow                               |
| `wrist-hand` | Forearm / wrist / hand  | forearm, wrist, hand, fingers                                         |
| `hip`        | Hip / glute             | hip joint (front), glute, outer hip, tailbone side                    |
| `groin`      | Groin / inner thigh     | inner thigh, adductors                                                |
| `quad`       | Front of thigh          | quadriceps                                                            |
| `hamstring`  | Back of thigh           | hamstring, hamstring attachment (sit bone)                            |
| `knee`       | Knee                    | front, inner, outer, back of knee, kneecap                            |
| `lower-leg`  | Calf / shin             | calf, shin                                                            |
| `ankle-foot` | Ankle / Achilles / foot | ankle, Achilles, heel, arch, toes                                     |

`ankle-foot` and `lower-leg` stay separate because calf and Achilles rehab differ. The spot name is stored on the injury, so the log can say "left hamstring" while the app works from the region.

Side rule: every spot has a side. Front or back centre spots (sternum, tailbone side, neck centre) are `center`; everything else is left or right from the tap.

## Aggravating movements (the "what makes it worse" question)

Movement tags the user can pick. Each lift gets tags from its name and muscles, so a flagged tag flags the right lifts, not only the right muscle.

| Tag            | Label                             | Example lifts                           |
| -------------- | --------------------------------- | --------------------------------------- |
| `squat`        | Squatting                         | back squat, leg press, goblet squat     |
| `hinge`        | Bending forward / deadlifts       | deadlift, RDL, good morning, row (bent) |
| `lunge`        | Lunges / single-leg work          | lunge, split squat, step-up             |
| `jump-run`     | Running / jumping                 | run, box jump, skipping                 |
| `calf-raise`   | Calf raises / pushing off toes    | calf raise                              |
| `press-over`   | Pressing overhead                 | overhead press, push press              |
| `press-flat`   | Pressing forward                  | bench press, push-up, dip               |
| `pull-vert`    | Pulling down / hanging            | pull-up, lat pulldown, dead hang        |
| `pull-horiz`   | Rowing                            | cable row, barbell row                  |
| `raise`        | Raising arms to the side or front | lateral raise, front raise, fly         |
| `curl`         | Curling                           | biceps curl                             |
| `extend`       | Straightening arm under load      | triceps extension, pushdown             |
| `grip`         | Gripping / carrying               | farmer carry, heavy hold                |
| `rotate`       | Twisting                          | woodchop, Russian twist                 |
| `flex-trunk`   | Sit-ups / crunching               | sit-up, crunch, leg raise               |
| `extend-trunk` | Arching back                      | back extension, bridge                  |
| `hip-thrust`   | Bridging / hip thrusts            | hip thrust, glute bridge                |
| `kneel-deep`   | Deep knee bend or kneeling        | deep squat, kneeling work               |

Each region offers its own subset (for example the knee offers squat, lunge, jump-run, kneel-deep; the shoulder offers press-over, press-flat, pull-vert, raise). The full per-region subsets are decided in A2 with the rehab content.

## Build notes for later

- Lift flagging changes from "muscle or name regex" to "movement tags": add a pure `movementTags(lift)` with tests over the whole library, then flag a lift when it shares a tag with the injury's aggravators or its primary muscle belongs to the injured region.
- The injury row needs new fields: region, spot (text id), onset (sudden or gradual), onset date, pain baseline, aggravators, clinician note. Migration to come with the intake build.
- Existing Run 3 injuries (7 areas) map to regions: ankle to `ankle-foot`, knee to `knee`, hip to `hip`, low-back to `low-back`, shoulder to `shoulder`, elbow-wrist to `elbow`, neck to `neck`.
