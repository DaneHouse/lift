Research draft for Kassra's review. Not medical advice. Content is written for LIFT from the cited sources and has not been reviewed by a clinician.

# Rehab research: neck, upper back, chest, shoulder

Covers region ids `neck`, `upper-back`, `chest`, `shoulder`. LIFT never diagnoses: "common causes" are things that often cause pain in an area, not a statement about the user.

Method note. Direct page fetches to NHS, JOSPT, AAOS and similar sites were blocked in the research environment. Everything cited below was confirmed from search-result summaries only, not by reading the full page. Where a number (days in stage, sets, reps) has no source it is marked "general practice, unverified". Stage minimum days are design inputs for the algorithm, not clinical rules. The guideline authors themselves say phases are a reference, not a fixed schedule.

Shared evidence used across regions:

- Graded exercise is supported for neck and shoulder pain (JOSPT neck guideline 2017, JOSPT rotator cuff guideline 2025, systematic reviews). No single exercise type is clearly best, so progressions below are chosen for being easy to do, not because one is proven superior.
- Pain rule used for all regions below (general practice, unverified for shoulder and neck; the pain-monitoring model comes from tendon rehab and has not been validated for the shoulder): pain up to about 3 out of 10 during an exercise is acceptable if it settles within 24 hours and is not worse the next morning. Higher than that, or still raised after 24 hours, means cut the dose.

---

## neck — Neck

### Common causes of pain here

- Sleeping in an awkward position or holding one posture for hours (sudden onset on waking, or gradual over a desk day). Source: NHS.
- Long periods of poor posture, such as head-forward at a screen (gradual overuse). Source: NHS.
- A pinched or irritated nerve in the neck, often with arm symptoms (gradual or sudden). Source: NHS.
- Whiplash-type injury from a fall, collision or hard contact (sudden). Source: NHS.
- Over-shrugging and gripping the neck muscles under heavy lifts such as squats, deadlifts, overhead presses (gradual overuse; general practice, unverified).
- Bar resting on the upper back or neck during squats, or neck craning on bench or crunches (gradual; general practice, unverified).
- Stress and poor sleep tightening the shoulder and neck muscles (gradual; general practice, unverified).

### Aggravating movements (tags)

- `press-over`: overhead pressing makes people shrug and crane the neck.
- `pull-vert`: pulldowns and pull-ups load the upper traps and neck, especially behind the neck or with a jutting chin.
- `squat`: a bar across the upper back compresses and loads the neck muscles.
- `hinge`: heavy deadlifts and holds cause strong shrugging and neck bracing.
- `raise`: upright rows and shrug-style raises load the upper traps.
- `flex-trunk`: crunches with hands behind the head pull on the neck.
- `grip`: heavy carries and holds make the shoulders and neck tense.
- `rotate`: fast or loaded rotation can irritate a stiff neck (general practice, unverified).

### Stage-by-stage rehab

**Protect.** Goal: calm the pain, keep the neck moving gently, stay active.
Typical minimum time in stage: 3 days (general practice; NHS says most neck pain settles in a few weeks).

| Exercise           | libraryId | mode | sets x reps/seconds | Cue                                                               | Why at this stage                                                                                             |
| ------------------ | --------- | ---- | ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Chin tuck (seated) | null      | reps | 2 x 10              | Slide the chin straight back, keep eyes level, no pain.           | Pain-free movement without load; gentle range of motion is a standard early step in the JOSPT neck guideline. |
| Neck side stretch  | 1403      | time | 2 x 20 s            | Ear toward shoulder, shoulder stays down, stop at a mild stretch. | Keeps side range of motion.                                                                                   |
| Scapular squeeze   | null      | reps | 2 x 10              | Shoulder blades back and down, no shrug.                          | Starts shoulder blade control with no neck load.                                                              |

**Restore.** Goal: wake up the deep neck and shoulder blade muscles with light holds.
Typical minimum time in stage: 7 days (general practice, unverified).

| Exercise                           | libraryId | mode | sets x reps/seconds | Cue                                                                             | Why at this stage                                                                                         |
| ---------------------------------- | --------- | ---- | ------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Lying chin tuck hold               | null      | time | 3 x 10 s            | Lie on your back, small nod, press the back of the head lightly into the floor. | Deep neck flexor training has moderate evidence for pain and function in neck pain (overview of reviews). |
| Isometric neck hold (hand on head) | null      | time | 3 x 10 s            | Press the head into your hand at about 20 percent effort, no movement.          | Isometric strengthening is an acute option in the JOSPT decision tree.                                    |
| Band reverse fly                   | 0993      | reps | 2 x 12              | Light band, lead with the elbows, neck long.                                    | Scapular strength is part of the JOSPT neck exercise approach.                                            |

**Rebuild.** Goal: add real load to the upper back so the neck stops doing the work.
Typical minimum time in stage: 10 days (general practice, unverified).

| Exercise         | libraryId | mode | sets x reps/seconds | Cue                                                           | Why at this stage                                         |
| ---------------- | --------- | ---- | ------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| Cable seated row | 0861      | reps | 3 x 10              | Chest tall, pull to the ribs, shoulders away from the ears.   | Strengthens the shoulder blade muscles with no neck load. |
| Dumbbell shrug   | 0406      | reps | 3 x 10              | Light weight, lift straight up, slow lower, head still.       | Gradual loading of the upper traps once they are calm.    |
| Cable pulldown   | 0198      | reps | 3 x 10              | Pull to the upper chest, chin neutral, never behind the neck. | Brings vertical pulling back in a neck-friendly way.      |

**Return.** Goal: heavier and lift-specific work back with a calm neck.
Typical minimum time in stage: 14 days (general practice, unverified).

| Exercise                       | libraryId | mode | sets x reps/seconds | Cue                                                            | Why at this stage                                              |
| ------------------------------ | --------- | ---- | ------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| Farmers walk                   | 2133      | time | 3 x 30 s            | Tall posture, ribs down, do not shrug up to the ears.          | Loaded carry tests neck and upper trap endurance.              |
| Dumbbell seated shoulder press | 0405      | reps | 3 x 8               | Back against the pad, head neutral, stop short of pain.        | Overhead work returns in a position that keeps the neck still. |
| Assisted pull-up               | 0017      | reps | 3 x 6               | Start the pull by lowering the shoulder blades, not shrugging. | Restores vertical pulling under bodyweight.                    |

### Swap rules

| Flagged tag  | Safer exercise                   | Why                                                                  |
| ------------ | -------------------------------- | -------------------------------------------------------------------- |
| `press-over` | 0603 lever shoulder press        | Seated with the head supported, so the neck stays still.             |
| `pull-vert`  | 0579 lever front pulldown        | Machine path keeps the head neutral, no neck craning.                |
| `squat`      | 1760 dumbbell goblet squat       | No bar on the upper back or neck.                                    |
| `flex-trunk` | 0276 dead bug                    | Trains the trunk without pulling the head forward.                   |
| `press-flat` | 0577 lever chest press           | Back supported, no neck strain from lifting off the bench.           |
| `raise`      | 0380 dumbbell rear lateral raise | Hits the rear shoulder without the upper-trap shrug of upright rows. |

### Progression criteria notes

- Move up when: minimum days done, last 3 check-ins at 4 or higher, at least 75 percent of rehab done, and pain with the stage exercises is no more than about 3 out of 10 and settled within 24 hours.
- Drop back when: a check-in of 2 or lower, 2 skipped sessions, new arm tingling or pain spreading down the arm, or morning stiffness clearly worse for 2 days in a row.
- Neck pain often settles in a few weeks; if there is no improvement after a few weeks, advise seeing a physio or doctor (NHS).

### Red flags specific to this region

- Neck pain after a fall, collision or other trauma, especially with severe pain despite simple painkillers: stop loading and see a doctor or physio urgently (NHS 111 or urgent care).
- Neck pain with severe or unusual headache, slurred speech, trouble swallowing, dizziness or blackouts: stop training and get emergency care.
- Weakness in an arm or leg, clumsy hands (trouble with buttons or coins), balance or walking problems, pins and needles in both arms or both legs, or bladder or bowel changes: stop training and go to emergency care.
- A band of pain around the chest or chest tightness together with neck pain: emergency care.
- Sudden stiffness in the neck and both shoulders: see a doctor soon.
- Arm symptoms that are new or worsening: stop loading the neck and see a physio or doctor.

---

## upper-back — Upper back

### Common causes of pain here

- Muscle strain from rowing, deadlifting or lifting with a rounded upper back (sudden, or gradual overuse).
- Long hours of poor posture, especially after a period of not training (gradual). Source: Cleveland Clinic.
- Overuse from repetitive pulling or carrying; the muscles linking the shoulder blade to the ribs can tighten or strain (gradual). Source: Cleveland Clinic.
- Rib joint irritation from twisting, coughing, or heavy bracing (sudden or gradual; general practice, unverified).
- Disc or joint problems and arthritis (usually gradual; Cleveland Clinic lists them as possible causes).
- Fracture or injury after a fall or impact (sudden; Cleveland Clinic).
- Stress and shallow breathing making the muscles between the shoulder blades tight (gradual; general practice, unverified).

### Aggravating movements (tags)

- `pull-horiz`: rows load the mid back directly, so a strained area complains first.
- `pull-vert`: pull-ups and pulldowns load the lats and shoulder blade muscles.
- `hinge`: bent-over positions make the mid back hold the spine position.
- `rotate`: twisting loads the rib joints and mid back.
- `extend-trunk`: loaded back extensions load the thoracic erectors.
- `squat`: a bar on the back sits right on sore muscles.
- `grip`: heavy holds and carries pull on the lats and mid back.

### Stage-by-stage rehab

**Protect.** Goal: ease pain and keep the upper back and ribs moving.
Typical minimum time in stage: 3 days (general practice, unverified; Cleveland Clinic says call a provider if there is no improvement after a week).

| Exercise           | libraryId | mode | sets x reps/seconds | Cue                                                                | Why at this stage                                                         |
| ------------------ | --------- | ---- | ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Cat-cow            | null      | reps | 2 x 10              | Slow, small range, breathe with the movement.                      | Gentle movement without load; staying moving is general self-care advice. |
| Rib-cage breathing | null      | time | 3 x 30 s            | Lie on your back, breathe low and wide into the sides of the ribs. | Eases guarding in the mid back and ribs (general practice, unverified).   |
| Scapular squeeze   | null      | reps | 2 x 10              | Shoulder blades back and down, light effort.                       | Wakes up the shoulder blade muscles with no load.                         |

**Restore.** Goal: restore thoracic rotation and extension, add light shoulder blade work.
Typical minimum time in stage: 7 days (general practice, unverified).

| Exercise                        | libraryId | mode | sets x reps/seconds | Cue                                                 | Why at this stage                                                                                                         |
| ------------------------------- | --------- | ---- | ------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Open book (side-lying rotation) | null      | reps | 2 x 8 each side     | Keep the knees stacked, turn only the upper back.   | Restores thoracic rotation (general practice, unverified).                                                                |
| Band reverse fly                | 0993      | reps | 2 x 12              | Light band, arms wide, squeeze the shoulder blades. | Light mid-back load; scapular exercise reduces shoulder and upper-back pain in reviews (Khodaverdizadeh 2023; Bury 2016). |
| Incline scapula push-up         | 3011      | reps | 2 x 10              | Arms straight, only the shoulder blades move.       | Trains the serratus and blade control.                                                                                    |

**Rebuild.** Goal: build pulling strength in supported positions.
Typical minimum time in stage: 10 days (general practice, unverified).

| Exercise             | libraryId | mode | sets x reps/seconds | Cue                                                       | Why at this stage                                  |
| -------------------- | --------- | ---- | ------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| Lever seated row     | 1350      | reps | 3 x 10              | Chest on the pad, pull the elbows back, pause at the end. | Chest support takes spine control out of the task. |
| Dumbbell incline row | 0327      | reps | 3 x 10              | Chest on the incline bench, elbows to the hips.           | Supported, adjustable load.                        |
| Cable pulldown       | 0198      | reps | 3 x 10              | Pull to the upper chest, ribs down, no leaning back.      | Brings back vertical pulling with control.         |

**Return.** Goal: lift-specific rowing and pulling at full load.
Typical minimum time in stage: 14 days (general practice, unverified).

| Exercise                           | libraryId | mode | sets x reps/seconds | Cue                                                        | Why at this stage                            |
| ---------------------------------- | --------- | ---- | ------------------- | ---------------------------------------------------------- | -------------------------------------------- |
| Barbell bent over row              | 0027      | reps | 3 x 8               | Flat back, brace, pull to the lower ribs.                  | Unsupported pulling that matches training.   |
| Pull-up                            | 0652      | reps | 3 x 5               | Start by lowering the shoulder blades, full control down.  | Bodyweight vertical pull at full range.      |
| Cable straight arm pulldown (rope) | 0237      | reps | 3 x 12              | Arms nearly straight, squeeze the lats down to the thighs. | Lat strength and control without elbow bend. |

### Swap rules

| Flagged tag    | Safer exercise                | Why                                             |
| -------------- | ----------------------------- | ----------------------------------------------- |
| `pull-horiz`   | 1350 lever seated row         | Chest support takes load off the mid back.      |
| `pull-vert`    | 0579 lever front pulldown     | Machine path is controlled, easy to scale down. |
| `hinge`        | 0327 dumbbell incline row     | Chest on the bench, no hip hinge needed.        |
| `rotate`       | 0276 dead bug                 | Trunk work without twisting.                    |
| `squat`        | 0739 sled 45 degree leg press | Nothing on the upper back.                      |
| `extend-trunk` | 0276 dead bug                 | Trains the trunk without loaded back extension. |

### Progression criteria notes

- Move up when: minimum days done, last 3 check-ins at 4 or higher, at least 75 percent of rehab done, and no pain with deep breaths or twisting during the stage work.
- Drop back when: a check-in of 2 or lower, 2 skipped sessions, pain returning with rows, or new pain on deep breathing.
- If upper back pain does not improve after a week, advise seeing a physio or doctor (Cleveland Clinic).

### Red flags specific to this region

- Upper back pain with chest pain, chest pressure, shortness of breath, sweating, or spreading to the arm or jaw: do not train, call emergency services.
- Upper back pain after a fall or impact with severe pain on breathing: stop loading and see a doctor urgently (possible rib or spine injury).
- Fever, unexplained weight loss, or bowel or bladder changes with back pain: see a doctor promptly (Cleveland Clinic).
- Tingling or numbness in the legs or buttocks, or severe pain or spasms: see a doctor (Cleveland Clinic).
- Pain at rest or at night that does not ease with position change: stop loading the area and see a physio or doctor.

---

## chest — Chest

### Common causes of pain here

- Pec muscle strain from bench press, dips or flyes (sudden, or gradual overuse).
- A tendon tear at the pec attachment, typically a sudden pop during a heavy press (sudden; AAOS OrthoInfo).
- Irritation where the ribs meet the breastbone, often sharp on deep breaths or when pressed (can be sudden or gradual; secondary health sites).
- Rib or intercostal muscle strain from coughing, twisting or heavy bracing (sudden or gradual; general practice, unverified).
- Overuse of the front shoulder and pec from high-volume pressing with little pulling (gradual; general practice, unverified).
- Chest pain can also come from the heart or lungs, which is why any chest pain with the red flags below is treated as an emergency first (NHS).

### Aggravating movements (tags)

- `press-flat`: bench and push-ups load the pec directly.
- `press-over`: overhead pressing stretches and loads the pec/front shoulder.
- `extend`: dips and triceps pressing load the lower pec and its tendon.
- `raise`: flyes and wide-arm movements stretch the pec under load.
- `rotate`: twisting loads the rib joints.
- `flex-trunk`: crunches can pull on the rib front.

### Stage-by-stage rehab

**Protect.** Goal: settle pain, keep breathing and arm movement comfortable.
Typical minimum time in stage: 3 days for mild strains (general practice, unverified). A suspected tendon tear needs a clinician before any loading.

| Exercise             | libraryId | mode | sets x reps/seconds | Cue                                                     | Why at this stage                                                        |
| -------------------- | --------- | ---- | ------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| Rib-cage breathing   | null      | time | 3 x 30 s            | Slow breaths, feel the ribs expand, stay in comfort.    | Keeps the chest wall moving without load (general practice, unverified). |
| Palm press isometric | null      | time | 3 x 10 s            | Press the palms together at chest height at low effort. | Light isometric activation of the pec.                                   |
| Wall push-up         | 0659      | reps | 2 x 10              | Stay well inside the pain-free range.                   | Smallest possible pressing load.                                         |

**Restore.** Goal: full pain-free range, light pressing.
Typical minimum time in stage: 7 days (general practice, unverified).

| Exercise                | libraryId | mode | sets x reps/seconds | Cue                                                          | Why at this stage                              |
| ----------------------- | --------- | ---- | ------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Incline push-up         | 0493      | reps | 3 x 8               | Hands on a bench, body straight, slow lower.                 | Light, scalable bodyweight press.              |
| Band seated chest press | 3124      | reps | 3 x 12              | Light band, smooth press, no pinching in the front shoulder. | Controlled resistance with a short lever.      |
| Push-up plus            | 3145      | reps | 2 x 10              | Press away from the floor at the top.                        | Wakes up the serratus, which supports the pec. |

**Rebuild.** Goal: progressive load through a safe, mid-range path.
Typical minimum time in stage: 14 days (general practice, unverified). Rebuilding after a repaired pec tear follows a surgeon's protocol and is much longer (see sources).

| Exercise             | libraryId | mode | sets x reps/seconds | Cue                                                  | Why at this stage                                  |
| -------------------- | --------- | ---- | ------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| Dumbbell bench press | 0289      | reps | 3 x 10              | Light weight, elbows about 45 degrees from the body. | Neutral load with a limited stretch at the bottom. |
| Lever chest press    | 0577      | reps | 3 x 10              | Seat at a height where the handles are at mid chest. | Fixed path for a steady load increase.             |
| Cable standing fly   | 0227      | reps | 2 x 12              | Very light, small arc, stop before a deep stretch.   | Reintroduces a stretched pec position gradually.   |

**Return.** Goal: heavy pressing and normal training range.
Typical minimum time in stage: 21 days (general practice, unverified; protocols after tendon repair allow light bench around 4 months and full strengthening around 6 months, HSS and surgeon protocols).

| Exercise                     | libraryId | mode | sets x reps/seconds | Cue                                               | Why at this stage                                        |
| ---------------------------- | --------- | ---- | ------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| Barbell bench press          | 0025      | reps | 3 x 6               | Control the descent, do not bounce off the chest. | Full barbell pressing, the lift that loads the pec most. |
| Dumbbell incline bench press | 0314      | reps | 3 x 8               | Lower to the full range only when pain-free.      | Different angle loads the upper pec and shoulder.        |
| Push-up                      | 0662      | reps | 3 x 10              | Straight body, chest to the floor under control.  | Full bodyweight pressing capacity.                       |

### Swap rules

| Flagged tag  | Safer exercise            | Why                                                             |
| ------------ | ------------------------- | --------------------------------------------------------------- |
| `press-flat` | 0577 lever chest press    | Fixed path, easy to scale down.                                 |
| `press-flat` | 0493 incline push-up      | Lighter bodyweight press.                                       |
| `extend`     | 0577 lever chest press    | Avoids deep dip stretch on the pec tendon.                      |
| `raise`      | 0227 cable standing fly   | Controlled arc with light load instead of heavy dumbbell flyes. |
| `press-over` | 0603 lever shoulder press | Supported, limits the stretch on the front of the chest.        |
| `flex-trunk` | 0276 dead bug             | Trains the trunk without pulling on the rib front.              |

### Progression criteria notes

- Move up when: minimum days done, last 3 check-ins at 4 or higher, at least 75 percent of rehab done, no pain on a deep breath, and no bruising or swelling in the chest.
- Drop back when: a check-in of 2 or lower, 2 skipped sessions, sharp pain at the chest or armpit on pressing, or pain on deep breaths returning.
- A suspected pec tendon tear should not progress in the app at all; the stage plan applies to mild strains and rib-front pain only.

### Red flags specific to this region

- Chest pain, pressure or tightness, especially squeezing, with shortness of breath, sweating, nausea, feeling unwell, or pain spreading to the arm, jaw, neck or back: emergency, do not train, call emergency services (NHS).
- New chest pain during exercise that does not behave like a muscle (no tender spot, not worse when pressed or moving the arm): do not keep training, get urgent medical care.
- A pop or tearing feeling during a press, bruising of the chest or upper arm, a change in shape of the chest or armpit, or sudden weakness pushing: stop loading and see a doctor urgently; repair works best early (AAOS OrthoInfo, HSS).
- Coughing blood, or sudden sharp pain with breathlessness: emergency care.
- Pain after a direct impact to the ribs with trouble breathing: urgent care.

---

## shoulder — Shoulder

### Common causes of pain here

- Rotator cuff tendon irritation from overhead or pressing volume (gradual overuse; JOSPT 2025 guideline topic).
- Tendon or muscle tear, often with sudden pain and weakness after a fall or heavy lift (sudden; NHS lists torn tendon or ligament).
- Shoulder instability or dislocation after a fall or wrenching movement (sudden; NHS).
- Frozen shoulder: pain and stiffness that lasts months (gradual; NHS).
- Arthritis or general joint wear, often in older lifters (gradual; NHS).
- Front-delt overuse from heavy bench and overhead work with too little rear-shoulder and pulling work (gradual; general practice, unverified).
- Referred pain from the neck (can be sudden or gradual; general practice, unverified).

### Aggravating movements (tags)

- `press-over`: overhead pressing loads the cuff and squeezes tendon space.
- `press-flat`: bench and dips load the front of the shoulder.
- `raise`: lateral raises, front raises and upright rows load the cuff at shoulder height.
- `pull-vert`: pull-ups and pulldowns load the shoulder in a long, hanging position.
- `pull-horiz`: rows with a wide elbow or a big stretch irritate the back of the shoulder.
- `extend`: dips and deep triceps extensions put the shoulder in an extended, stretched position.
- `grip`: hanging and heavy carries load the shoulder in traction.

### Stage-by-stage rehab

**Protect.** Goal: calm pain, keep the arm moving, avoid the aggravating positions.
Typical minimum time in stage: 3 days (general practice, unverified). NHS says do not stop using the shoulder completely.

| Exercise                                   | libraryId | mode | sets x reps/seconds | Cue                                                                     | Why at this stage                                                                  |
| ------------------------------------------ | --------- | ---- | ------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Pendulum swing                             | null      | time | 2 x 30 s            | Lean on a table, let the arm hang, swing in small circles.              | Gentle movement when active lifting is irritable (phase-based protocols).          |
| Isometric external rotation (against wall) | null      | time | 3 x 20 s            | Elbow at the side, press the back of the hand into a wall, no movement. | Isometrics in a comfortable range are an early step in phase-based cuff protocols. |
| Scapular squeeze                           | null      | reps | 2 x 12              | Blades back and down, no shrug.                                         | Starts shoulder blade control with no cuff load.                                   |

**Restore.** Goal: restore pain-free movement and light cuff and blade strength.
Typical minimum time in stage: 7 days (general practice, unverified).

| Exercise                                  | libraryId | mode | sets x reps/seconds | Cue                                           | Why at this stage                                                                                                |
| ----------------------------------------- | --------- | ---- | ------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Cable standing shoulder external rotation | 0235      | reps | 3 x 12              | Elbow tucked at the side, very light, slow.   | Cuff strengthening is the core of cuff rehab (JOSPT 2025 guideline).                                             |
| Band standing rear delt row               | 1022      | reps | 3 x 12              | Light band, elbows wide, squeeze the blades.  | Light scapular and rear-shoulder strength.                                                                       |
| Scapula push-up                           | 3021      | reps | 2 x 10              | Arms straight, move only the shoulder blades. | Scapula-focused exercise gave short-term pain and function benefit in reviews (Bury 2016; Khodaverdizadeh 2023). |

**Rebuild.** Goal: increase load across the cuff and back of the shoulder.
Typical minimum time in stage: 14 days (general practice, unverified).

| Exercise                                  | libraryId | mode | sets x reps/seconds | Cue                                                 | Why at this stage                              |
| ----------------------------------------- | --------- | ---- | ------------------- | --------------------------------------------------- | ---------------------------------------------- |
| Dumbbell lying external shoulder rotation | 0863      | reps | 3 x 10              | Elbow on the side, slow up, slower down.            | Progressive cuff load in a supported position. |
| Dumbbell rear lateral raise               | 0380      | reps | 3 x 12              | Light weight, lead with the elbows, body supported. | Rear-shoulder strength to balance pressing.    |
| Lever seated row                          | 1350      | reps | 3 x 10              | Shoulders away from the ears, pull to the ribs.     | Heavier pulling with chest support.            |

**Return.** Goal: pressing and pulling back at lift weights with a controlled range.
Typical minimum time in stage: 21 days (general practice, unverified).

| Exercise                                  | libraryId | mode | sets x reps/seconds | Cue                                                                     | Why at this stage                                          |
| ----------------------------------------- | --------- | ---- | ------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| Dumbbell seated shoulder press            | 0405      | reps | 3 x 8               | Back supported, press slightly forward of the body, stop short of pain. | Overhead work returns last because it loads the cuff most. |
| Cable pulldown                            | 0198      | reps | 3 x 10              | Pull to the upper chest, shoulders down, no shrug.                      | Restores vertical pulling.                                 |
| Cable standing shoulder external rotation | 0235      | reps | 3 x 15              | Heavier than in Restore, elbow tucked.                                  | Keep cuff work in the program as a maintenance step.       |

### Swap rules

| Flagged tag  | Safer exercise                                      | Why                                                            |
| ------------ | --------------------------------------------------- | -------------------------------------------------------------- |
| `press-over` | 0404 dumbbell seated shoulder press (parallel grip) | Neutral grip gives the cuff more room than a wide bar.         |
| `press-flat` | 0352 dumbbell neutral grip bench press              | Neutral grip is kinder to the front of the shoulder.           |
| `pull-vert`  | 0818 twin handle parallel grip lat pulldown         | Parallel grip keeps the arms in a stronger position.           |
| `pull-horiz` | 1350 lever seated row                               | Chest support and a fixed path limit the stretch.              |
| `raise`      | 0380 dumbbell rear lateral raise                    | Works the back of the shoulder, away from the sore front area. |
| `extend`     | 0577 lever chest press                              | Avoids dips; keeps pressing in a safer range.                  |

### Progression criteria notes

- Move up when: minimum days done, last 3 check-ins at 4 or higher, at least 75 percent of rehab done, and exercise pain no more than about 3 out of 10 and settled within 24 hours (pain-monitoring rule borrowed from tendon rehab; not validated for shoulder).
- Drop back when: a check-in of 2 or lower, 2 skipped sessions, pain staying raised after a session or flaring the next day (physitrack-style phase guidance: reduce dose), or a new night pain.
- Phases are a reference, not a schedule (rotator cuff phase guide). Let symptoms, not the calendar, decide.
- If the shoulder has not improved after 2 weeks, advise seeing a doctor or physio (NHS).

### Red flags specific to this region

- Shoulder that looks out of place or has changed shape after a fall or wrench: stop loading and get urgent care (NHS).
- Sudden or very bad pain, or being unable to move or lift the arm: stop loading and get urgent medical care (NHS).
- Marked swelling, a hot or cold arm, loss of feeling, or pins and needles that do not go away: urgent medical care (NHS).
- Severe pain in both shoulders, or fever and feeling unwell with shoulder pain: urgent medical care (NHS).
- Shoulder pain with chest pain, shortness of breath or pain spreading to the jaw: emergency, call emergency services.
- Pain starting after an injury such as a fall: stop loading and see a doctor.
- Pain at night or at rest that is getting worse, or stiffness that is lasting months: see a physio or doctor (NHS lists persistent stiffness as a reason to see a GP).

---

## Sources

Confirmed through search-result summaries only (page fetches were blocked; full text was not read):

- https://www.nhs.uk/conditions/neck-pain-and-stiff-neck/ and https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/ : common neck pain causes, red flags needing urgent help, whiplash guidance, "settles in a few weeks".
- https://www.newcastle-hospitals.nhs.uk/wp-content/uploads/2021/11/2024-Newcastle-OHS-Neck-Pain-leaflet_PRINT_ONLY.pdf : emergency neck warning signs (speech, balance, clumsy hands, bilateral limb symptoms, bladder).
- https://www.orthopt.org/uploads/content_files/files/Neck%20Pain%20Revision%20Decision%20Tree%202017%20-%20Ortho%20Section.pdf : JOSPT 2017 neck pain with mobility deficits decision tree (acute ROM, stretching and isometric options; cervico-scapulothoracic strengthening).
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10007860 : confirmed the guideline reference (JOSPT 47(7), 2017) and use of scapular exercise in practice.
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6263552 : deep cervical flexor training systematic review (12 RCTs; physiological outcomes).
- https://www.qigonginstitute.org/abstract-print/20561 : overview of 52 reviews of neck exercise; moderate evidence for deep neck flexor training.
- https://pure.ul.ie/en/publications/rotator-cuff-tendinopathy-diagnosis-nonsurgical-medical-care-and-/ and https://www.physiotutors.com/rotator-cuff-tendinopathy-the-new-2025-clinical-practice-guideline/ : JOSPT 2025;55(4):235-274 rotator cuff tendinopathy guideline (scope, evidence grades). Exercise dosing not confirmed.
- https://www.physitrack.com/insights/rotator-cuff-treatment-phase-based-guide-physical-therapists : four-phase cuff rehab structure, early isometrics, pendulum, reduce dose if pain rises (phases as reference, not schedule).
- https://www.nhs.uk/conditions/shoulder-pain/ : do not stop using the shoulder, see GP after 2 weeks, urgent signs (sudden pain, cannot move arm, changed shape, numbness, injury).
- https://111.wales.nhs.uk/encyclopaedia/s/article/shoulderpain/ : NHS Wales page, supports shoulder instability and dislocation after injury.
- https://keele-repository.worktribe.com/output/406161/effectiveness-of-scapula-focused-approaches-in-patients-with-rotator-cuff-related-shoulder-pain-a-systematic-review-and-meta-analysis : Bury 2016, scapula-focused exercise helps short term.
- https://irj.uswr.ac.ir/article-1-1793-fa.html : Khodaverdizadeh 2023 review of 11 RCTs, scapular exercise reduces shoulder pain.
- https://clok.uclan.ac.uk/17223 : 2012 systematic review, exercise supports pain and function in rotator cuff tendinopathy.
- https://clinicaltrials.gov/study/NCT05124769 : PASE trial, shows pain-allowed shoulder exercise is still unproven.
- https://my.clevelandclinic.org/health/symptoms/22866-upper-back-pain : upper back causes, self-care, when to call a provider.
- https://orthoinfo.aaos.org/en/diseases--conditions/pectoralis-tendon-tear : pec tendon tear symptoms (pop, bruising, weakness), early repair is best.
- https://www.hss.edu/health-library/conditions-and-treatments/pectoralis-major-tendon-injuries : pec tear signs and post-repair timeline (sling 4 to 6 weeks, light weights about 4 months, sport about 6 months).
- https://m.massgeneral.org/assets/MGH/pdf/orthopaedics/sports-medicine/physical-therapy/rehabilitation-protocol-for-pectoralis-major-repair.pdf : post-repair phases (protect to week 3, active work from weeks 6 to 8).
- https://www.england.nhs.uk/2023/08/nhs-launches-lifesaving-campaign-to-help-people-spot-a-heart-attack/ : heart attack symptoms (chest tightness, spread to arm, jaw, back; sweating, breathlessness); call 999.
- https://www.hingehealth.com/resources/articles/costochondritis-symptoms/ and https://www.medicalnewstoday.com/articles/318797.php : secondary sources for rib-front (costochondritis) pain behavior. Weaker sources; NHS or Cleveland Clinic not retrieved.

## Not verified (general practice, unverified)

- All stage minimum days and set and rep schemes, except where a source is named.
- The 3 out of 10 pain / 24-hour rule for neck and shoulder.
- Thoracic open book, rib-cage breathing, and chin tuck prescriptions (standard clinical practice but no source confirmed here).
- Conservative (non-surgical) pec strain timelines: only post-repair protocols were found.
