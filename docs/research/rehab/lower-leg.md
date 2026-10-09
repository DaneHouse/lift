> Research draft for Kassra's review. Not medical advice. Content is written for LIFT from the cited sources and has not been reviewed by a clinician.

# Rehab content: ankle-foot, lower-leg, knee, quad

Regions covered: `ankle-foot`, `lower-leg`, `knee`, `quad`.

How to read this file:

- Sources are numbered S1 to S20 in the Sources section at the end. Citations in the text point to those numbers.
- "general practice, unverified" means the number or rule is common in clinical practice but I could not tie it to a source I could read. These are the first things a clinician should review.
- Research limits: nhs.uk, orthoinfo.aaos.org and my.clevelandclinic.org could not be opened from this environment (blocked). Their pages were not read. Where an NHS fact appears, it comes from a search summary of that page and is marked as such. Full text of the JOSPT guidelines was also not read; I only saw abstracts and secondary summaries of them.
- LIFT never diagnoses. "Common causes" lists describe things that commonly cause pain in a region. They are not a statement about the user.
- Stage minimum days below are suggested defaults for the algorithm (Protect 3, Restore 7-14, Rebuild 14-21, Return 14). They are tunable constants, not clinical rules.
- Exercises with `null` as libraryId become custom exercises.
- Dosage format: sets x reps, or sets x seconds for time items.

---

## ankle-foot — Ankle / Achilles / heel / arch / toes

### Common causes of pain here

- Lateral ankle sprain (rolled ankle): sudden. The most common ankle injury; many people recover well, some are left with a feeling of instability (S1, S2).
- Achilles tendon pain a few centimetres above the heel: gradual overuse, often after a jump in running, jumping or calf volume. Recovery commonly takes months (S3).
- Pain at the back of the heel where the tendon attaches, or under the heel: gradual. Heel pain under the foot is often worse with the first steps in the morning (S4).
- Arch or sole pain: gradual, linked to more time on feet, new footwear, or sudden mileage increase (S4).
- Big toe or forefoot pain: gradual, often from jumping, sprinting or pushing off in stiff or thin shoes (general practice, unverified).
- Achilles tendon tear: sudden, often a pop and sudden weakness. This is a red flag, not a training problem (S6).
- Stress injury to a foot or ankle bone: gradual, pain that builds with impact and does not ease with warm-up (S11).
- Ankle pinching or stiffness after an old sprain: gradual (S1).

### Aggravating movements

| Tag        | Why                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------- |
| squat      | Deep squats need a lot of ankle bend; a stiff or sore ankle or Achilles gets pinched or overloaded. |
| lunge      | Single-leg balance plus ankle bend under load; a sprained ankle gives way here.                     |
| jump-run   | Impact and fast tendon loading; the usual trigger for Achilles and heel pain.                       |
| calf-raise | Directly loads the Achilles and the foot's arch and toes.                                           |
| kneel-deep | Pushes the ankle and toes into extreme bending under body weight.                                   |
| hinge      | Mild: balance demand on single-leg versions only (general practice, unverified).                    |

### Stage-by-stage rehab

#### Protect

Goal: calm the area, keep gentle pain-free movement, protect against re-injury.
Typical minimum time in stage: 3 days (algorithm default; early gentle movement is favoured over long rest after a sprain, S10).

| Exercise                    | libraryId | mode | sets x reps/sec | Cue                                                               | Why at this stage                                                                                                 |
| --------------------------- | --------- | ---- | --------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Ankle circles               | `1368`    | reps | 2 x 15          | Slow, both directions, stay inside comfort.                       | Keeps range moving without load.                                                                                  |
| Seated isometric calf press | null      | time | 4 x 30 s        | Sit, push the ball of the foot into the floor at a gentle effort. | Loads the Achilles and calf with no joint movement (isometric work is a common first step for sore tendons, S17). |
| Double-leg balance hold     | null      | time | 3 x 20 s        | Stand tall near a wall, eyes forward.                             | Restarts balance control early (S1, S10).                                                                         |

#### Restore

Goal: full pain-free range and basic strength on both feet.
Typical minimum time in stage: 10 days (algorithm default; general practice).

| Exercise                       | libraryId | mode | sets x reps/sec | Cue                                   | Why at this stage                                 |
| ------------------------------ | --------- | ---- | --------------- | ------------------------------------- | ------------------------------------------------- |
| Bodyweight standing calf raise | `1373`    | reps | 3 x 12          | Two feet up, three seconds down.      | First real calf and Achilles loading, controlled. |
| Balance board                  | `0020`    | time | 3 x 30 s        | Keep the board level, soft knees.     | Balance training lowers repeat sprains (S10).     |
| Single-leg balance hold        | null      | time | 3 x 30 s        | Soft knee, steady hips, eyes forward. | Single-leg control before heavier work.           |

#### Rebuild

Goal: single-leg strength with load, slow lowering, and step control.
Typical minimum time in stage: 14 days (algorithm default; tendon-type problems often need much longer, S3).

| Exercise                           | libraryId | mode | sets x reps/sec | Cue                                                       | Why at this stage                                                             |
| ---------------------------------- | --------- | ---- | --------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Standing calf raise on a staircase | `1490`    | reps | 3 x 10          | Heel drops below the step, three seconds down, pause low. | Full range loading of the tendon and calf.                                    |
| Band single-leg calf raise         | `0999`    | reps | 3 x 12          | Full height, slow lower, hold a rail.                     | One-sided strength; tendon loading at "as heavy as tolerated" over time (S3). |
| Dumbbell step-up                   | `0431`    | reps | 3 x 8           | Push through the whole foot, no wobble.                   | Functional ankle control under load.                                          |

#### Return

Goal: heavy calf strength, then spring and landing control for lifting, running and jumping.
Typical minimum time in stage: 14 days (algorithm default; general practice).

| Exercise                          | libraryId | mode | sets x reps/sec | Cue                                                 | Why at this stage                                                     |
| --------------------------------- | --------- | ---- | --------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| Lever standing calf raise (heavy) | `0605`    | reps | 4 x 6           | Slow up and down, pause at the top.                 | Heavy loading builds capacity (S3).                                   |
| Pogo hop                          | null      | reps | 3 x 10          | Stiff ankles, quick contact, small height.          | Reintroduces spring before running and jumping (S17, secondary).      |
| Box jump down, one-leg landing    | `1374`    | reps | 3 x 5           | Step off, land on one foot, freeze for two seconds. | Landing control for sport and lifting (general practice, unverified). |

### Swap rules

| Flagged tag | Safer library exercise                | Why                                                                                   |
| ----------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| squat       | `0739` Sled 45 leg press              | Supported, short ankle bend, no balance demand.                                       |
| lunge       | `2611` Lever horizontal one leg press | Trains one leg with no balance load on the ankle.                                     |
| calf-raise  | `0594` Lever seated calf raise        | Seated and supported; lower load through the Achilles (general practice, unverified). |
| jump-run    | `0739` Sled 45 leg press              | Strength work for the legs without impact.                                            |
| kneel-deep  | `1409` Barbell glute bridge           | Hip-dominant, no deep ankle or toe bend.                                              |

### Progression criteria notes

Move up a stage when:

- Minimum days in stage have passed (see above).
- The last 3 check-ins were 4 or above and at least 75% of rehab was done.
- Next-day soreness: pain at or below about 2 out of 10 during the exercise and no more than mild stiffness next morning (rule of thumb used in tendon rehab, S17; general practice).
- Practical gates (general practice, unverified): Restore needs a full-range pain-free double-leg calf raise x 15 and a 30 s single-leg balance. Rebuild needs a single-leg calf raise x 15 without pain. Return needs single-leg calf raise near 20 (S9, calf data) and pain-free hopping in place.

Drop back a stage when:

- A check-in is 2 or lower, or 2 rehab sessions in a row are skipped.
- Morning heel or Achilles pain gets worse for two days after a session.
- The ankle gives way or swells after a session.

### Red flags specific to this region

- A pop or snap at the back of the ankle, followed by sudden weakness or trouble pushing off: stop loading and see a doctor urgently (same day or urgent care) (S6, search summary; S3 notes tendon problems).
- Cannot take four steps on the ankle straight after the injury, or pinpoint tenderness on the bony back edge or tip of the ankle bones: stop loading and get it checked, as a fracture is possible (S7, S8).
- The ankle or foot looks deformed, or the toes look white or blue, or are numb: emergency care (S8).
- Pain that is sharp over one spot on a foot bone and builds with every impact: stop loading and see a physio or doctor (S11, general practice).
- Fever with a hot, red, swollen ankle: urgent care (S8, search summary).

### Sources for this region

S1, S2, S3, S4, S6, S7, S8, S9, S10, S11, S17.

---

## lower-leg — Calf / shin

### Common causes of pain here

- Calf muscle strain (a tear in a calf muscle): sudden, often during a push-off, sprint or jump (S9).
- Calf tightness and soreness from a big jump in volume (running, calf raises, hill work): gradual overuse (S9).
- Shin splints (pain along the inner edge of the shin bone): gradual, linked to quick increases in running or jumping, tight or weak calves, hard surfaces or worn shoes (S12, S13).
- Stress reaction or stress fracture of the shin bone: gradual, pain at a small spot that does not ease with warm-up and can show up at rest (S11, S14).
- Cramping or deep ache during exercise that settles quickly with rest: usually gradual; if it is tight, hard or worsening it needs a check (general practice, unverified).
- Referred pain from the lower back or the knee: gradual, may include tingling or numbness (general practice, unverified).
- Blood clot in a calf vein: can appear with no clear cause. This is a red flag (S5).

### Aggravating movements

| Tag        | Why                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------- |
| calf-raise | Directly loads the calf muscles.                                                              |
| jump-run   | Repeated impact and fast calf work; the main trigger for shin splints and calf strains (S12). |
| lunge      | Long calf stretch under load at the bottom of the step.                                       |
| squat      | Deep squats stretch the calf and load it hard when heels lift.                                |
| kneel-deep | Stretches the front of the shin and ankle under body weight.                                  |

### Stage-by-stage rehab

#### Protect

Goal: settle pain and keep the muscle moving without stretching or loading it hard.
Typical minimum time in stage: 3 days (algorithm default; general practice).

| Exercise                    | libraryId | mode | sets x reps/sec | Cue                                                          | Why at this stage                                 |
| --------------------------- | --------- | ---- | --------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| Ankle circles               | `1368`    | reps | 2 x 15          | Slow, within comfort.                                        | Gentle pumping and movement.                      |
| Seated isometric calf press | null      | time | 4 x 30 s        | Push the ball of the foot into the floor at a gentle effort. | Contracts the calf with no stretch.               |
| Seated toe raise            | null      | reps | 2 x 15          | Heels down, lift the toes, lower slowly.                     | Gentle shin muscle work for the front of the leg. |

#### Restore

Goal: pain-free walking, full-range double-leg calf and shin strength.
Typical minimum time in stage: 7 days (algorithm default; mild calf strains are often 1-2 weeks, per a secondary source, S9).

| Exercise                       | libraryId | mode | sets x reps/sec | Cue                                                       | Why at this stage                            |
| ------------------------------ | --------- | ---- | --------------- | --------------------------------------------------------- | -------------------------------------------- |
| Bodyweight standing calf raise | `1373`    | reps | 3 x 12          | Straight knees, two feet up, three seconds down.          | Loads the larger calf muscle (S9).           |
| Dumbbell seated calf raise     | `1379`    | reps | 3 x 12          | Bent knee, light weight, full range.                      | Loads the deeper calf muscle (S9).           |
| Band toe raise                 | null      | reps | 3 x 15          | Heels on the floor, lift toes against a band, slow lower. | Builds the shin muscle that absorbs landing. |

#### Rebuild

Goal: heavy slow calf work on one leg, ready for impact again.
Typical minimum time in stage: 14 days (algorithm default; general practice).

| Exercise                           | libraryId | mode | sets x reps/sec | Cue                                  | Why at this stage                    |
| ---------------------------------- | --------- | ---- | --------------- | ------------------------------------ | ------------------------------------ |
| Standing calf raise on a staircase | `1490`    | reps | 3 x 10          | Three seconds down, small pause low. | Full range, slow lowering.           |
| Lever standing calf raise          | `0605`    | reps | 3 x 8           | Heavier, smooth tempo.               | Adds load to the straight-knee calf. |
| Dumbbell seated one leg calf raise | `0400`    | reps | 3 x 10          | Bent knee, one side at a time.       | Single-leg load for the deeper calf. |

#### Return

Goal: single-leg endurance and spring, then gradual return to impact.
Typical minimum time in stage: 14 days (algorithm default; general practice).

| Exercise                 | libraryId | mode | sets x reps/sec | Cue                                                     | Why at this stage                                             |
| ------------------------ | --------- | ---- | --------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| One-leg floor calf raise | `1387`    | reps | 3 x 15          | Full height, no pain; build toward 20 to 25 clean reps. | A common strength gate before running (S9, secondary source). |
| Pogo hop                 | null      | reps | 3 x 10          | Stiff ankles, quick ground contact.                     | Rebuilds spring and reactive strength (S9).                   |
| Walking lunge            | `1460`    | reps | 3 x 8           | Even steps, heel stays down.                            | Calf and shin work in a lifting pattern.                      |

### Swap rules

| Flagged tag | Safer library exercise                | Why                                                       |
| ----------- | ------------------------------------- | --------------------------------------------------------- |
| calf-raise  | `0594` Lever seated calf raise        | Seated and lighter; easier to keep inside pain limits.    |
| jump-run    | `0739` Sled 45 leg press              | Keeps leg strength going with no impact.                  |
| lunge       | `2611` Lever horizontal one leg press | One-sided work with no stretch at the bottom of the step. |
| squat       | `0739` Sled 45 leg press              | Controlled foot position; heels stay down.                |
| kneel-deep  | `1409` Barbell glute bridge           | Trains the hips without ankle or shin loading.            |

### Progression criteria notes

Move up a stage when:

- Minimum days in stage have passed.
- The last 3 check-ins were 4 or above and at least 75% of rehab was done.
- Walking is pain-free; calf feels no worse the next day (S9, secondary).
- Restore to Rebuild: 15 pain-free double-leg raises. Rebuild to Return: 15 pain-free single-leg raises. Return to normal training: single-leg raise near 20 to 25 and pain-free hopping in place (S9, secondary source; general practice).
- Shin splints: increase running or jumping load gradually, and keep low-impact work in the early weeks (S12).

Drop back a stage when:

- A check-in is 2 or lower, or 2 rehab sessions in a row are skipped.
- Sharp pain returns during a raise, or the calf feels tight or tender to touch the next morning.
- Shin pain moves from a long diffuse band to a small spot (see red flags).

### Red flags specific to this region

- Calf swelling, warmth or redness on one leg, with a throbbing ache: stop loading and get urgent medical help the same day (NHS 111 or urgent care). With breathlessness or chest pain call emergency services (S5, search summary of nhs.uk).
- A sudden "kick" or snap in the calf with immediate trouble standing on tiptoe: stop loading and see a doctor, as the Achilles or calf may be torn (S6).
- Pain at one small spot on the shin that hurts to hop on or press, or pain at rest or at night: stop loading and see a physio or doctor, as a stress fracture is possible (S11, S14).
- A very tight, hard, painful lower leg that does not ease with rest, or numbness, pins and needles or a weak foot: stop and get medical help urgently (general practice, unverified).

### Sources for this region

S5, S6, S9, S11, S12, S13, S14.

---

## knee — Knee

### Common causes of pain here

- Pain around or behind the kneecap (patellofemoral pain): usually gradual, common with squatting, stairs, running and sitting for long periods (S15, S16).
- Pain just below the kneecap at the tendon (patellar tendon pain): gradual, common with jumping, sprinting and repeated heavy knee-dominant lifting (S18, S19).
- Meniscus (cartilage cushion) irritation or tear: sudden with a twist on a planted foot, or gradual with age. Can cause catching or locking (S20).
- Ligament sprain (ACL, MCL and others): sudden, usually with a pivot, a hit or a landing. The knee often feels unstable (general practice, unverified).
- Outer knee pain from the band of tissue along the outside of the thigh: gradual, often with running or cycling (general practice, unverified).
- Stiffness and ache from wear in the joint (osteoarthritis): gradual, often worse after rest and better once moving (general practice, unverified).
- Referred pain from the hip or lower back: gradual (general practice, unverified).

### Aggravating movements

| Tag        | Why                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| squat      | Bending the knee under load is the classic trigger for kneecap pain; the guideline uses squatting to reproduce symptoms (S15). |
| lunge      | Deep single-leg knee bend with high joint stress.                                                                              |
| jump-run   | Impact and fast tendon loading at the front of the knee (S18).                                                                 |
| kneel-deep | Compresses the kneecap and loads a deeply bent knee.                                                                           |
| extend     | Leg extensions put heavy load on the kneecap and quad tendon through a long lever arm (general practice, unverified).          |
| rotate     | Twisting on a planted foot is the typical way meniscus and ligaments get hurt (S20, general practice).                         |

### Stage-by-stage rehab

#### Protect

Goal: settle pain, keep the knee moving, maintain muscle activation.
Typical minimum time in stage: 3 days (algorithm default; general practice).

| Exercise                       | libraryId | mode | sets x reps/sec | Cue                                                 | Why at this stage                                                                 |
| ------------------------------ | --------- | ---- | --------------- | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| Quad set (press knee straight) | null      | time | 4 x 10 s        | Tighten the thigh, press the back of the knee down. | Keeps the thigh muscle working with no joint motion.                              |
| Heel slide                     | null      | reps | 2 x 12          | Slide the heel in and out within comfort.           | Keeps knee bend and straightening.                                                |
| Low glute bridge               | `3013`    | reps | 2 x 12          | Squeeze at the top, ribs down.                      | Hip strength with minimal knee bend; hip and knee work together is advised (S15). |

#### Restore

Goal: pain-free range, light strength in a short knee-bend range, hip control.
Typical minimum time in stage: 14 days (algorithm default; tendon-related problems often need more, S18).

| Exercise                       | libraryId | mode | sets x reps/sec       | Cue                                                           | Why at this stage                                                                |
| ------------------------------ | --------- | ---- | --------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Wall sit, shallow              | null      | time | 4 x 30 s              | Back flat on the wall, knees at a shallow angle with no pain. | Isometric holds are a common first loading step for knee tendon pain (S18, S19). |
| Sled 45 leg press, short range | `0739`    | reps | 3 x 12                | Light, stop well before the painful angle.                    | Controlled knee loading in a pain-free range.                                    |
| Monster walk                   | `0628`    | reps | 3 x 10 steps each way | Band above the knees, push the knees out, soft steps.         | Hip control, part of the combined hip and knee approach (S15).                   |

#### Rebuild

Goal: strength through a larger range and on one leg.
Typical minimum time in stage: 21 days (algorithm default; heavy slow resistance work over several weeks is typical, S18, S19).

| Exercise                   | libraryId | mode | sets x reps/sec | Cue                                   | Why at this stage                                                              |
| -------------------------- | --------- | ---- | --------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| Dumbbell step-up           | `0431`    | reps | 3 x 10          | Low step, three seconds down.         | Single-leg strength with control.                                              |
| Dumbbell goblet squat      | `1760`    | reps | 3 x 8           | Slow down, stay in a pain-free depth. | Heavy slow resistance, the loading style with good tendon evidence (S18, S19). |
| Dumbbell Romanian deadlift | `1459`    | reps | 3 x 10          | Hips back, soft knees, back flat.     | Strengthens hamstrings and glutes that share knee load.                        |

#### Return

Goal: single-leg strength, landing control, then sport and lift-specific load.
Typical minimum time in stage: 14 days (algorithm default; general practice).

| Exercise                        | libraryId | mode | sets x reps/sec | Cue                                               | Why at this stage                           |
| ------------------------------- | --------- | ---- | --------------- | ------------------------------------------------- | ------------------------------------------- |
| Dumbbell single leg split squat | `0410`    | reps | 3 x 6           | Knee over the middle of the foot, slow and heavy. | Heavy single-leg strength.                  |
| Pogo hop                        | null      | reps | 3 x 10          | Small, quick, stiff-ankle hops.                   | Reintroduces impact in small steps.         |
| Box jump down, one-leg landing  | `1374`    | reps | 3 x 5           | Step off, land on one foot, hold for two seconds. | Landing control before jumping and running. |

### Swap rules

| Flagged tag | Safer library exercise      | Why                                                          |
| ----------- | --------------------------- | ------------------------------------------------------------ |
| squat       | `0739` Sled 45 leg press    | Set the range to a pain-free angle; supported.               |
| lunge       | `1008` Band step-up         | Low step with control; easier to cap the knee bend.          |
| jump-run    | `1409` Barbell glute bridge | Trains the hips and legs with no impact.                     |
| kneel-deep  | `1409` Barbell glute bridge | Avoids a deeply bent loaded knee.                            |
| extend      | `0586` Lever lying leg curl | Trains the back of the thigh and avoids loading the kneecap. |

### Progression criteria notes

Move up a stage when:

- Minimum days in stage have passed.
- The last 3 check-ins were 4 or above and at least 75% of rehab was done.
- Pain during exercise stays at or below about 2 out of 10 and settles within a day (rule of thumb from tendon rehab, S17; general practice).
- No swelling after sessions.
- Restore to Rebuild: 30 s shallow wall sit and 12 leg press reps with no pain. Rebuild to Return: 10 step-ups per side and a goblet squat to a comfortable depth with no pain (general practice, unverified).
- Return to normal lifting: single-leg split squat with load, no pain, even between sides.

Drop back a stage when:

- A check-in is 2 or lower, or 2 rehab sessions in a row are skipped.
- The knee swells, catches or feels like it will give way during or after a session.
- Pain climbs above about 3 out of 10 during an exercise, or is worse the next morning.

### Red flags specific to this region

- The knee is stuck and cannot be straightened after an injury (true locking): stop loading and get same-day assessment (urgent care); do not force it (S20, secondary).
- Cannot put weight on the leg, or the knee looks deformed after a fall or twist: urgent care or emergency (S20, S8 search summaries).
- A pop at the moment of injury, quick swelling within hours, or the knee gives way when pivoting: stop loading and see a doctor or physio soon (S20, general practice).
- Hot, red, swollen knee with fever: urgent care (S20, secondary).
- Calf swelling, warmth or redness after a knee injury or time off: possible blood clot, urgent (S5).
- Sudden inability to straighten the leg against resistance, with a gap above or below the kneecap: stop loading and see a doctor the same day (general practice, unverified).

### Sources for this region

S5, S8, S15, S16, S17, S18, S19, S20.

---

## quad — Front of thigh

### Common causes of pain here

- Quad muscle strain (a tear in the thigh muscle): sudden, during sprinting, kicking or a fast change of speed. Can be mild to severe (general practice, S21).
- Thigh bruise from a direct hit (contusion): sudden, impact-based. Needs care in the first days (S21).
- Soreness after a big change in squat, lunge or hill volume: gradual overuse; peaks one to two days after training (general practice, unverified).
- Pain at the top of the kneecap or at the tendon above it: gradual, linked to jumping and repeated heavy knee-dominant work (S18).
- Pain high in the front of the thigh, close to the hip: may come from the hip or a hip flexor, either sudden or gradual (general practice, unverified).
- Referred pain from the lower back or hip with tingling or burning down the front of the thigh: gradual (general practice, unverified).
- A hard lump or loss of knee bend a few weeks after a bad bruise (bone-like tissue forming in the muscle): rare complication, see red flags (S21).

### Aggravating movements

| Tag        | Why                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| squat      | Quads work hard through the whole range, mostly when rising from the bottom.                                    |
| lunge      | Long stretch and load on the front leg's quad.                                                                  |
| jump-run   | Fast quad contraction in sprinting, jumping and kicking; the typical strain trigger.                            |
| extend     | Isolates the quads under load.                                                                                  |
| kneel-deep | Stretches the quad at the knee (kneeling, sitting on heels).                                                    |
| hip-thrust | Mild: bottom position can stretch the rectus femoris if the knees are very bent (general practice, unverified). |

### Stage-by-stage rehab

#### Protect

Goal: settle bleeding and swelling, keep the muscle gently active, keep the knee bending.
Typical minimum time in stage: 3 days (algorithm default; early care after a bruise is about avoiding more bleeding for the first 24 to 48 hours, S21).

| Exercise         | libraryId | mode | sets x reps/sec | Cue                                       | Why at this stage                                                   |
| ---------------- | --------- | ---- | --------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Quad set         | null      | time | 4 x 10 s        | Tighten the thigh, keep the effort low.   | Keeps the muscle active with no stretch.                            |
| Heel slide       | null      | reps | 2 x 12          | Slide the heel in and out within comfort. | Protects knee bend (loss of bend is a concern after bruising, S21). |
| Low glute bridge | `3013`    | reps | 2 x 12          | Squeeze at the top.                       | Keeps the hips working with little quad stress.                     |

#### Restore

Goal: full pain-free range and light quad strength.
Typical minimum time in stage: 7 days (algorithm default; general practice).

| Exercise                      | libraryId | mode | sets x reps/sec | Cue                                            | Why at this stage                      |
| ----------------------------- | --------- | ---- | --------------- | ---------------------------------------------- | -------------------------------------- |
| Resistance band leg extension | `3007`    | reps | 3 x 12          | Light band, smooth tempo, stop short of pain.  | Gentle isolated quad loading.          |
| Sled 45 leg press, light      | `0739`    | reps | 3 x 12          | Short range first, add depth as it feels easy. | Controlled strength with support.      |
| Band step-up                  | `1008`    | reps | 3 x 10          | Low step, control the way down.                | Moves from machine to functional work. |

#### Rebuild

Goal: heavier loading through full range, both legs and then one leg.
Typical minimum time in stage: 14 days (algorithm default; general practice).

| Exercise              | libraryId | mode | sets x reps/sec | Cue                                    | Why at this stage                    |
| --------------------- | --------- | ---- | --------------- | -------------------------------------- | ------------------------------------ |
| Lever leg extension   | `0585`    | reps | 3 x 10          | Slow lowering, no pain at the top.     | Targeted quad strength with load.    |
| Dumbbell goblet squat | `1760`    | reps | 3 x 8           | Even depth on both sides, slow down.   | Functional squat pattern.            |
| Split squats          | `2368`    | reps | 3 x 8           | Torso tall, knee tracks over the foot. | Single-leg strength and quad length. |

#### Return

Goal: heavy strength, long-stride loading, then fast efforts.
Typical minimum time in stage: 14 days (algorithm default; severe muscle injuries can take much longer, S21).

| Exercise         | libraryId | mode | sets x reps/sec | Cue                                                   | Why at this stage                                                             |
| ---------------- | --------- | ---- | --------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| Sled hack squat  | `0743`    | reps | 4 x 6           | Heavy and slow, full range you control.               | Heavy quad loading with stable support.                                       |
| Walking lunge    | `1460`    | reps | 3 x 8           | Long even steps, no pain in the back leg stretch.     | Lengthened-position strength.                                                 |
| Build-up strides | null      | reps | 4 x 20 m        | Increase pace over the run, stay at about 70% effort. | Brings fast quad action back before sprinting (general practice, unverified). |

### Swap rules

| Flagged tag | Safer library exercise            | Why                                                             |
| ----------- | --------------------------------- | --------------------------------------------------------------- |
| squat       | `0739` Sled 45 leg press          | Adjustable range, supported, easy to dial the load down.        |
| lunge       | `1459` Dumbbell Romanian deadlift | Hip-dominant, keeps the quads out of a long stretch under load. |
| jump-run    | `1409` Barbell glute bridge       | Keeps the legs working with no sprinting or impact.             |
| extend      | `0586` Lever lying leg curl       | Trains the back of the thigh and rests the quads.               |
| hip-thrust  | `0586` Lever lying leg curl       | Avoids the stretched-quad position.                             |

### Progression criteria notes

Move up a stage when:

- Minimum days in stage have passed.
- The last 3 check-ins were 4 or above and at least 75% of rehab was done.
- Full pain-free knee bend with the hip straight (heel to the buttock) is a common gate before heavier work (S21).
- Restore to Rebuild: 12 band extensions and 12 light leg presses without pain. Rebuild to Return: goblet squat and split squat to comfortable depth, same strength on both sides.
- Return to normal training: pain-free heavy squat variations, then pain-free build-up strides, then sprints (general practice, unverified).

Drop back a stage when:

- A check-in is 2 or lower, or 2 rehab sessions in a row are skipped.
- Sharp pain or a new tight spot during a session, or the thigh feels hotter or more swollen the next day.
- Loss of knee bend that was previously there.

### Red flags specific to this region

- A visible gap, dent or sudden loss of the ability to straighten the knee: stop loading and see a doctor the same day (general practice, unverified).
- Severe pain, a very tight swollen thigh, or numbness and pins and needles in the leg after a heavy bruise: emergency care, as pressure inside the muscle can rise (S21).
- Pain with movement, a hard lump or night and morning pain more than 3 to 4 weeks after a bad bruise, or a knee that will not bend as before: stop loading and see a doctor for imaging (S21).
- One swollen, warm, red, painful leg: possible blood clot, urgent (S5).

### Sources for this region

S5, S18, S21.

---

## Sources

Only sources I could actually open or see in search results are listed. Where only a search summary was available, that is stated.

- S1: Martin et al., JOSPT 2021, lateral ankle ligament sprains revision. https://doi.org/10.2519/jospt.2021.0302 and PDF https://www.orthopt.org/uploads/content_files/files/jospt.2021.0302.pdf . Supported: scope (first-time sprain and chronic instability), most people recover but some stay unstable. Full text not read.
- S2: Overview of systematic reviews, "Treatment and prevention of acute and recurrent ankle sprain: an overview of systematic reviews", https://pubmed.ncbi.nlm.nih.gov/28053200/ . Supported: strong evidence for bracing, moderate for neuromuscular training for preventing recurrence; early mobilisation, exercise supported for pain and function. Abstract only.
- S3: JOSPT 2024 Achilles pain, stiffness and muscle power deficits (midportion Achilles tendinopathy), revision. https://www.orthopt.org/uploads/content_files/files/Achilles_Pain_revision_2024.pdf . Supported: tendon-loading exercise as first line, at least three times a week at a tolerable high intensity; recovery can take months. Search summary only; secondary: https://physicaltherapyfirst.com/blog/2024-clnical-practice-guideline-for-midportion-achilles-tendinopathy/ .
- S4: JOSPT 2023 Heel pain, plantar fasciitis, revision. https://pubmed.ncbi.nlm.nih.gov/38037331/ . Supported: calf and plantar fascia stretching, and progressive resistance exercise, as the exercise core. Secondary summaries only: https://www.pplbiomechanics.com/blogs/news/managing-plantar-fasciitis-new-updates-to-the-2014-clinical-practice-guidelines .
- S5: NHS, deep vein thrombosis. https://www.nhs.uk/conditions/deep-vein-thrombosis-dvt/ . Supported (from a search summary; page not opened): one-leg throbbing pain, swelling, warm and red skin; seek urgent help; emergency services with breathlessness or chest pain.
- S6: NHS, Achilles tendon rupture, https://www.nhs.uk/conditions/achilles-tendon-rupture/ . Could NOT be opened; the "pop and sudden weakness" red flag is general practice, unverified. Listed only as the page to verify against.
- S7: Ottawa ankle rules summary. https://wikem.org/wiki/Ottawa_ankle_rules_calculator . Supported: inability to take four steps, or bone tenderness at the back edge or tip of the ankle bones, calls for an X-ray. Secondary source.
- S8: NHS, broken ankle. https://www.nhs.uk/content-widgets/health-a-to-z/broken-ankle and healthdirect, sprained ankle, https://www.healthdirect.gov.au/sprained-ankle . Supported (search summaries): emergency care for deformity, severe pain, white/blue/numb toes; see a doctor if you cannot bear weight or if things get worse.
- S9: Calf strain rehab, Physio-Network. https://www.physio-network.com/?p=92058 . Supported (search summary, secondary): strength and function criteria rather than time, single-leg calf raise endurance of about 20 to 25, painless hopping, straight-knee versus bent-knee raises for the two calf muscles, mild strains in about 1 to 2 weeks. Weak source; clinician review recommended.
- S10: Treatment of acute ankle ligament injuries, systematic review. https://pubmed.ncbi.nlm.nih.gov/23712708/ . Supported: early functional treatment and balance training over prolonged immobilisation. Abstract only.
- S11: Medial tibial stress fracture diagnosis and treatment guidelines. https://pubmed.ncbi.nlm.nih.gov/33298373/ . Supported: stress fractures present with focal tenderness and pain that can persist at rest. Abstract only.
- S12: Shin splint: a review. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9937638/ . Supported: causes (training load jumps, footwear, calf imbalance) and low-impact options early. Abstract only.
- S13: Preventive interventions for medial tibial stress syndrome, systematic review. https://pubmed.ncbi.nlm.nih.gov/40633262/ . Supported: neuromuscular training helps prevent shin splints; no support for static stretching.
- S14: AAFP, stress fractures. https://www.aafp.org/afp/2011/0101/p39.html . Supported: hop test and focal tenderness raise suspicion; hop test not well validated.
- S15: JOSPT 2019 patellofemoral pain guideline (Willy et al.). https://doi.org/10.2519/jospt.2019.0302 . Supported: combined hip and knee exercise; squatting reproduces pain; passive modalities not recommended. Full text not read.
- S16: American Family Physician summary of the PFP guideline. https://www.aafp.org/pubs/afp/issues/2020/1001/p442.pdf . Supported: hip weakness appears secondary to PFP, exercise as the core of care.
- S17: Achilles tendon loading phases (clinic blog, secondary). https://www.pogophysio.com.au/blog/the-3-key-stages-for-achilles-tendinopathy-exercises/ . Supported: isometrics for irritable tendons, slow heavy work later, plyometrics after, pain at about 2 out of 10 or less as a progression guide. Not peer reviewed.
- S18: Network meta-analysis of eccentric, isometric and heavy slow resistance for patellar tendinopathy. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11570476/ . Supported: loading types compared. Abstract only.
- S19: Systematic review (Bakke and Bjerke, HVL thesis). https://hvlopen.brage.unit.no/hvlopen-xmlui/bitstream/handle/11250/3019124/Bakke_Bjerke.pdf?sequence=1 . Supported: eccentric and heavy slow resistance favoured (grade B), isometric and isotonic satisfactory (grade C). Student thesis, secondary.
- S20: Meniscus red flags (secondary). https://mskdoctors.com/doctors/tanvi-verma/articles/meniscus-tear-symptoms-when-to-seek-medical-advice . Supported (search summary): a locked knee that cannot be straightened, quick swelling, inability to bear weight, hot red knee with fever, and giving way need prompt assessment. Official AAOS/NHS pages could not be opened.
- S21: Quadriceps muscle contusion, Physiopedia. https://physio-pedia.com/Quadricpes_Muscle_Contusion . Supported (search summary): compression and rest in the first 24 to 48 hours, loss of knee bend, myositis ossificans if pain persists past 3 to 4 weeks, compartment syndrome risk. Also https://pmc.ncbi.nlm.nih.gov/articles/PMC2941577/ (review of thigh contusion, abstract only).

Not verified at all: quad strain staging, the toe/forefoot cause, exercise dosages (sets x reps) for every stage, the practical gates for moving between stages, and the swap rules. Those follow general practice and need clinician review.
