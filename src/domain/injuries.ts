import type { ExerciseMode } from './exercises';

export type InjuryArea =
  | 'ankle'
  | 'knee'
  | 'hip'
  | 'low-back'
  | 'shoulder'
  | 'elbow-wrist'
  | 'neck';
export type InjurySide = 'left' | 'right' | 'both' | 'center';
export type InjuryStage = 'protect' | 'restore' | 'rebuild' | 'return';
/** `referred` = red flag raised: the area is not loaded until the user clears it. */
export type InjuryStatus = 'active' | 'referred' | 'resolved';

export type Injury = {
  id: string;
  area: InjuryArea;
  side: InjurySide;
  stage: InjuryStage;
  status: InjuryStatus;
  description: string;
  startedAt: string;
  /** When the injury entered its current stage. */
  stageSince: string;
};

export const DISCLAIMER =
  'LIFT is not medical advice. It does not diagnose. If something feels wrong, see a physio or doctor.';

export const injuryAreas: { value: InjuryArea; label: string }[] = [
  { value: 'ankle', label: 'Ankle / calf / Achilles' },
  { value: 'knee', label: 'Knee' },
  { value: 'hip', label: 'Hip' },
  { value: 'low-back', label: 'Low back' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'elbow-wrist', label: 'Elbow / wrist' },
  { value: 'neck', label: 'Neck' },
];
const shortNames: Record<InjuryArea, string> = {
  ankle: 'ankle',
  knee: 'knee',
  hip: 'hip',
  'low-back': 'low back',
  shoulder: 'shoulder',
  'elbow-wrist': 'elbow/wrist',
  neck: 'neck',
};
/** Lower-case short name for one-line reasons. */
export const areaShort = (area: InjuryArea) => shortNames[area];
export const areaLabel = (area: InjuryArea) =>
  injuryAreas.find((entry) => entry.value === area)?.label ?? area;

export const stages: { value: InjuryStage; label: string; hint: string }[] = [
  { value: 'protect', label: 'Protect', hint: 'Calm it down. Gentle, pain-free movement only.' },
  { value: 'restore', label: 'Restore', hint: 'Get range and light strength back.' },
  { value: 'rebuild', label: 'Rebuild', hint: 'Load it progressively.' },
  { value: 'return', label: 'Return', hint: 'Back to full training, with a safety net.' },
];
const stageOrder = stages.map((stage) => stage.value);
export const nextStage = (stage: InjuryStage) => stageOrder[stageOrder.indexOf(stage) + 1];
export const previousStage = (stage: InjuryStage) => stageOrder[stageOrder.indexOf(stage) - 1];

// ---- rehab menus (written for LIFT) -------------------------------------------------

export type RehabItem = {
  name: string;
  /** Bundled library id. Items without one become custom exercises. */
  libraryId?: string;
  mode: Extract<ExerciseMode, 'reps' | 'time'>;
  sets: number;
  /** Reps, or seconds for a hold. */
  amount: number;
  cue: string;
};

const reps = (
  name: string,
  libraryId: string | undefined,
  sets: number,
  amount: number,
  cue: string,
): RehabItem => ({ name, ...(libraryId ? { libraryId } : {}), mode: 'reps', sets, amount, cue });
const hold = (
  name: string,
  libraryId: string | undefined,
  sets: number,
  amount: number,
  cue: string,
): RehabItem => ({ name, ...(libraryId ? { libraryId } : {}), mode: 'time', sets, amount, cue });

export const rehabMenus: Record<InjuryArea, Record<InjuryStage, RehabItem[]>> = {
  ankle: {
    protect: [
      reps('Ankle circles', '1368', 2, 15, 'Slow and pain free, both directions.'),
      reps('Seated calf raise', '0594', 2, 15, 'Light load, smooth tempo.'),
      hold('Double-leg balance hold', undefined, 3, 20, 'Stand tall, eyes forward.'),
    ],
    restore: [
      reps('Bodyweight calf raise', '1373', 3, 12, 'Two feet up, three seconds down.'),
      hold('Balance board', '0020', 3, 30, 'Keep the board level.'),
      hold('Single-leg balance hold', undefined, 3, 30, 'Soft knee, steady hips.'),
    ],
    rebuild: [
      reps('Band single-leg calf raise', '0999', 3, 12, 'Full range, slow lower.'),
      reps('Standing calf raise machine', '0605', 3, 10, 'Pause at the top.'),
      hold('Single-leg balance hold', undefined, 3, 40, 'Eyes closed for the last set if steady.'),
    ],
    return: [
      reps('One-leg calf raise', '1384', 3, 8, 'Heavy, full range.'),
      reps('Pogo hop', undefined, 3, 10, 'Light, quick ground contact.'),
      reps('Dumbbell step-up', '0431', 3, 8, 'Drive through the whole foot.'),
    ],
  },
  knee: {
    protect: [
      hold('Quad set', undefined, 3, 10, 'Press the knee straight, squeeze the thigh.'),
      reps('Heel slide', undefined, 2, 12, 'Slide the heel in and out within comfort.'),
      reps('Low glute bridge', '3013', 2, 12, 'Squeeze at the top, ribs down.'),
    ],
    restore: [
      reps('Leg extension machine', '0585', 3, 12, 'Light weight, stop short of pain.'),
      reps('Low glute bridge', '3013', 3, 15, 'Pause for one second at the top.'),
      hold('Wall sit', undefined, 3, 20, 'Shallow angle, back flat on the wall.'),
    ],
    rebuild: [
      reps('Dumbbell step-up', '0431', 3, 10, 'Low step, control the way down.'),
      reps('Leg press', '0739', 3, 10, 'Short range first, then deepen.'),
      reps('Lying leg curl', '0586', 3, 12, 'Slow lower.'),
    ],
    return: [
      reps('Goblet squat', '1760', 3, 8, 'Even weight through both feet.'),
      reps('Single-leg bridge', '3645', 3, 10, 'Hips level.'),
      reps('Walking lunge', '1460', 3, 8, 'Short steps, knee tracks over the toes.'),
    ],
  },
  hip: {
    protect: [
      reps('Clamshell', undefined, 2, 15, 'Feet together, rotate from the hip, not the back.'),
      reps('Low glute bridge', '3013', 2, 12, 'Squeeze at the top.'),
      reps('Pelvic tilt', '3147', 2, 12, 'Small, smooth movement.'),
    ],
    restore: [
      reps('Clamshell', undefined, 3, 15, 'Add a band when it feels easy.'),
      reps('Seated hip abduction', '0597', 3, 12, 'Light load, no pinching.'),
      reps('Low glute bridge', '3013', 3, 15, 'Pause at the top.'),
    ],
    rebuild: [
      reps('Monster walk', '0628', 3, 12, 'Stay low, keep tension on the band.'),
      reps('Single-leg bridge', '3645', 3, 10, 'Hips level.'),
      reps('Side hip abduction', '0710', 3, 12, 'Slow, no swinging.'),
    ],
    return: [
      reps('Dumbbell step-up', '0431', 3, 8, 'Control the way down.'),
      reps('Single-leg bridge', '3645', 3, 12, 'Hips level.'),
      reps('Monster walk', '0628', 3, 15, 'Stay low, keep tension on the band.'),
    ],
  },
  'low-back': {
    protect: [
      reps('Pelvic tilt', '3147', 2, 12, 'Small, smooth movement.'),
      reps('Dead bug', '0276', 2, 8, 'Low back stays flat on the floor.'),
      reps('Low glute bridge', '3013', 2, 10, 'Squeeze the glutes, do not arch.'),
    ],
    restore: [
      reps('Bird dog', undefined, 3, 8, 'Reach long, hips stay square.'),
      reps('Dead bug', '0276', 3, 10, 'Exhale as the leg goes out.'),
      hold('Side bridge', '0705', 3, 20, 'Straight line from head to feet.'),
    ],
    rebuild: [
      reps('Band pallof press', '0979', 3, 10, 'Resist the twist.'),
      reps('Back extension', '0489', 3, 10, 'Stop at neutral, do not overextend.'),
      hold('Side bridge', '0705', 3, 30, 'Straight line from head to feet.'),
    ],
    return: [
      reps('Back extension', '0489', 3, 12, 'Slow up, slow down.'),
      reps('Band vertical pallof press', '1015', 3, 10, 'Ribs down, stay tall.'),
      reps('Dead bug', '0276', 3, 12, 'Add a light weight in each hand.'),
    ],
  },
  shoulder: {
    protect: [
      hold('Pendulum swing', undefined, 2, 30, 'Let the arm hang and swing gently.'),
      reps('Scapular squeeze', undefined, 2, 12, 'Pull the shoulder blades back and down.'),
      reps('Wall slide', undefined, 2, 10, 'Slide up only as far as it is comfortable.'),
    ],
    restore: [
      reps('Cable external rotation', '0235', 3, 12, 'Elbow tucked, very light.'),
      reps('Scapular squeeze', undefined, 3, 12, 'Hold each rep for two seconds.'),
      reps('Wall slide', undefined, 3, 10, 'Keep ribs down.'),
    ],
    rebuild: [
      reps('Dumbbell external rotation', '0864', 3, 10, 'Slow and controlled.'),
      reps('Rear lateral raise', '0380', 3, 12, 'Light weight, lead with the elbows.'),
      reps('Seated machine row', '1350', 3, 10, 'Shoulders away from the ears.'),
    ],
    return: [
      reps('Cable lateral raise', '0178', 3, 12, 'No shrugging.'),
      reps('Machine shoulder press', '0603', 3, 8, 'Stop short of pain.'),
      reps('Cable external rotation', '0235', 3, 15, 'Elbow tucked.'),
    ],
  },
  'elbow-wrist': {
    protect: [
      reps('Wrist circles', '1428', 2, 15, 'Slow, pain-free range.'),
      hold(
        'Isometric wrist extension hold',
        undefined,
        3,
        20,
        'Push the back of the hand into the other palm.',
      ),
    ],
    restore: [
      reps('Band wrist curl', '1016', 3, 15, 'Light band, full range.'),
      reps('Light wrist extension', undefined, 3, 15, 'Palm down, tiny weight.'),
      reps('Hammer curl', '0313', 2, 12, 'Light, neutral grip.'),
    ],
    rebuild: [
      reps('Cable wrist curl', '0247', 3, 12, 'Slow lower.'),
      reps('Reverse curl', '0080', 3, 10, 'Wrists straight.'),
      reps('Triceps pushdown', '0241', 3, 12, 'Elbows pinned.'),
    ],
    return: [
      reps('Hammer curl', '0313', 3, 10, 'Control the way down.'),
      reps('Cable pushdown', '0201', 3, 10, 'Elbows pinned.'),
      reps('Reverse curl', '0080', 3, 12, 'Wrists straight.'),
    ],
  },
  neck: {
    protect: [
      reps('Chin tuck', undefined, 2, 10, 'Glide the head straight back, no tilting.'),
      hold('Neck side stretch', '1403', 2, 20, 'Gentle, no pulling.'),
      reps('Scapular squeeze', undefined, 2, 12, 'Pull the shoulder blades back and down.'),
    ],
    restore: [
      reps('Chin tuck', undefined, 3, 10, 'Hold each rep for three seconds.'),
      reps('Scapular squeeze', undefined, 3, 12, 'Hold each rep for two seconds.'),
      hold('Isometric neck hold', undefined, 3, 10, 'Press the head into your hand, no movement.'),
    ],
    rebuild: [
      reps('Dumbbell shrug', '0406', 3, 10, 'Straight up and down, no rolling.'),
      reps('Cable rear delt row', '0203', 3, 12, 'Lead with the elbows.'),
      hold('Isometric neck hold', undefined, 3, 20, 'Press the head into your hand, no movement.'),
    ],
    return: [
      reps('Dumbbell shrug', '0406', 3, 12, 'Straight up and down.'),
      reps('Machine shoulder press', '0603', 3, 8, 'Seated, head against the pad.'),
      reps('Cable rear delt row', '0203', 3, 12, 'Lead with the elbows.'),
    ],
  },
};

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
/** Id used for the session slot: the library id, or the custom id created for it. */
export const rehabExerciseId = (item: Pick<RehabItem, 'name' | 'libraryId'>) =>
  item.libraryId ?? `custom-${slug(item.name)}`;

// ---- which lifts load which area ----------------------------------------------------

type AreaRule = { muscles: string[]; names: RegExp };
const areaRules: Record<InjuryArea, AreaRule> = {
  ankle: { muscles: ['calves'], names: /squat|lunge|step.?up|jump|hop|sprint|run|calf/i },
  knee: { muscles: ['quads'], names: /squat|lunge|step.?up|leg press|jump|extension|hack/i },
  hip: {
    muscles: ['glutes', 'abductors', 'adductors'],
    names: /squat|deadlift|lunge|bridge|thrust|step.?up|abduction|good morning/i,
  },
  'low-back': {
    muscles: ['spine'],
    names:
      /deadlift|squat|good morning|back extension|hyperextension|clean|snatch|bent.?over|barbell row/i,
  },
  shoulder: {
    muscles: ['delts', 'serratus anterior'],
    names: /press|raise|fly|push.?up|dip|pull.?up|overhead|snatch|clean/i,
  },
  'elbow-wrist': {
    muscles: ['forearms', 'biceps', 'triceps'],
    names: /curl|extension|pushdown|press|pull.?up|chin.?up|dip|wrist/i,
  },
  neck: { muscles: ['levator scapulae', 'traps'], names: /shrug|overhead|neck|upright/i },
};

export type SessionLift = { id: string; name: string; muscles: string[] };

export function loadsArea(area: InjuryArea, lift: SessionLift) {
  const rule = areaRules[area];
  return lift.muscles.some((muscle) => rule.muscles.includes(muscle)) || rule.names.test(lift.name);
}

// ---- check-in, swaps and the session plan -------------------------------------------

export type SwapRule = {
  match: RegExp;
  to: { id: string; name: string; mode: 'reps' | 'time' };
  why: string;
};

/** Safer variations: machine, seated or supported versions of the lifts that stress an area. */
export const swapRules: Record<InjuryArea, SwapRule[]> = {
  ankle: [
    {
      match: /calf/i,
      to: { id: '0594', name: 'Seated calf raise', mode: 'reps' },
      why: 'seated calf raise loads the ankle less than standing',
    },
    {
      match: /squat|lunge|step.?up|jump|hop/i,
      to: { id: '0739', name: 'Leg press', mode: 'reps' },
      why: 'leg press is supported and keeps the ankle from carrying your balance',
    },
  ],
  knee: [
    {
      match: /squat|lunge|step.?up|jump|hack/i,
      to: { id: '0739', name: 'Leg press', mode: 'reps' },
      why: 'leg press lets you set a shallower knee angle with support',
    },
    {
      match: /extension/i,
      to: { id: '0586', name: 'Lying leg curl', mode: 'reps' },
      why: 'leg curl works the leg without loading the knee joint front',
    },
  ],
  hip: [
    {
      match: /squat|lunge|step.?up|deadlift|good morning/i,
      to: { id: '0739', name: 'Leg press', mode: 'reps' },
      why: 'leg press limits hip range and removes balance demand',
    },
    {
      match: /bridge|thrust|abduction/i,
      to: { id: '3013', name: 'Low glute bridge', mode: 'reps' },
      why: 'low bridge keeps the hip in a short, comfortable range',
    },
  ],
  'low-back': [
    {
      match: /row/i,
      to: { id: '1350', name: 'Seated machine row', mode: 'reps' },
      why: 'chest-supported seated row takes the load off the low back',
    },
    {
      match: /deadlift|squat|good morning|clean|snatch/i,
      to: { id: '0739', name: 'Leg press', mode: 'reps' },
      why: 'leg press trains the legs with the back supported',
    },
    {
      match: /extension|hyperextension/i,
      to: { id: '0276', name: 'Dead bug', mode: 'reps' },
      why: 'dead bug trains the trunk without loading the spine',
    },
  ],
  shoulder: [
    {
      match: /press|push.?up|dip|overhead/i,
      to: { id: '0404', name: 'Seated dumbbell press, neutral grip', mode: 'reps' },
      why: 'seated and neutral grip is kinder to the shoulder joint',
    },
    {
      match: /raise|fly/i,
      to: { id: '0235', name: 'Cable external rotation', mode: 'reps' },
      why: 'light rotator cuff work instead of loaded raises',
    },
    {
      match: /pull.?up|chin/i,
      to: { id: '0198', name: 'Cable pulldown', mode: 'reps' },
      why: 'pulldown lets you control the range and load',
    },
  ],
  'elbow-wrist': [
    {
      match: /curl/i,
      to: { id: '0313', name: 'Hammer curl', mode: 'reps' },
      why: 'neutral grip is easier on the elbow and wrist',
    },
    {
      match: /extension|pushdown|press|dip/i,
      to: { id: '0200', name: 'Rope pushdown', mode: 'reps' },
      why: 'rope lets the wrists stay neutral',
    },
    {
      match: /pull.?up|chin/i,
      to: { id: '0198', name: 'Cable pulldown', mode: 'reps' },
      why: 'pulldown lets you choose a comfortable grip and load',
    },
  ],
  neck: [
    {
      match: /shrug|upright/i,
      to: { id: '0203', name: 'Cable rear delt row', mode: 'reps' },
      why: 'rear delt row avoids loading the upper traps and neck',
    },
    {
      match: /overhead|press/i,
      to: { id: '0603', name: 'Machine shoulder press', mode: 'reps' },
      why: 'seated with head support keeps the neck still',
    },
  ],
};

export type CheckinInput = { score: number; redFlag: boolean };
export type PlannedRehab = {
  injuryId: string;
  area: InjuryArea;
  stage: InjuryStage;
  items: RehabItem[];
};
export type SessionAdjustments = {
  rehab: PlannedRehab[];
  /** Keyed by the session slot's exercise id. */
  swaps: Record<string, { to: SwapRule['to']; why: string }>;
  skips: Record<string, string>;
  notices: string[];
};

const active = (injury: Injury) => injury.status === 'active';

/** Injuries whose area today's session loads, so a check-in is worth asking for. */
export function injuriesToCheck(injuries: Injury[], lifts: SessionLift[]) {
  return injuries.filter(
    (injury) => active(injury) && lifts.some((lift) => loadsArea(injury.area, lift)),
  );
}

export const RED_FLAG_QUESTIONS = [
  'Swelling that is not settling',
  'Numbness or tingling',
  'The joint gives way or locks',
  'Pain at night or at rest',
  'Getting worse week to week',
] as const;

export function referOutMessage(area: InjuryArea) {
  return `${areaLabel(area)}: stop loading this area. These signs need a physio or doctor to look at it. LIFT will leave this area alone until you mark it cleared.`;
}

/**
 * Turns active injuries plus today's check-in scores into rehab blocks, safe swaps and skips.
 * A missing check-in means no adjustment beyond the rehab block at the current stage.
 * Score under 3 swaps flagged lifts; under 2 the area is protect-only today.
 */
export function planInjurySession(
  injuries: Injury[],
  checkins: Record<string, CheckinInput>,
  lifts: SessionLift[],
): SessionAdjustments {
  const result: SessionAdjustments = { rehab: [], swaps: {}, skips: {}, notices: [] };
  const inSession = new Set(lifts.map((lift) => lift.id));
  for (const injury of injuries) {
    if (injury.status === 'resolved') continue;
    const flagged = lifts.filter((lift) => loadsArea(injury.area, lift));
    if (!flagged.length) continue;
    const label = areaShort(injury.area);
    const checkin = checkins[injury.id];
    if (injury.status === 'referred') {
      for (const lift of flagged)
        result.skips[lift.id] = `${label} is on hold until you have had it checked`;
      result.notices.push(referOutMessage(injury.area));
      continue;
    }
    if (checkin?.redFlag) {
      for (const lift of flagged)
        result.skips[lift.id] = `${label}: red flag reported, area not loaded`;
      result.notices.push(referOutMessage(injury.area));
      continue;
    }
    const protectOnly = !!checkin && checkin.score < 2;
    const stage: InjuryStage = protectOnly ? 'protect' : injury.stage;
    result.rehab.push({
      injuryId: injury.id,
      area: injury.area,
      stage,
      items: rehabMenus[injury.area][stage],
    });
    if (!checkin || checkin.score >= 3) continue;
    for (const lift of flagged) {
      if (result.skips[lift.id] || result.swaps[lift.id]) continue;
      if (protectOnly) {
        result.skips[lift.id] = `${label} check-in ${checkin.score}/5: protect-only today`;
        continue;
      }
      const rule = swapRules[injury.area].find((candidate) => candidate.match.test(lift.name));
      const target = rule?.to.id;
      if (!rule || !target || target === lift.id || inSession.has(target)) {
        result.skips[lift.id] =
          `${label} check-in ${checkin.score}/5: no safe variation, skipped today`;
        continue;
      }
      inSession.add(target);
      result.swaps[lift.id] = {
        to: rule.to,
        why: `${label} check-in ${checkin.score}/5: ${rule.why}`,
      };
    }
  }
  return result;
}

// ---- graduation ----------------------------------------------------------------------

export type CheckinRecord = { date: string; score: number };
export type RehabLog = { date: string; completed: boolean; easy: boolean };
export type StageSuggestion =
  | { action: 'none'; reason: string }
  | { action: 'advance' | 'regress'; to: InjuryStage; reason: string }
  | { action: 'resolve'; reason: string };

const DAY = 24 * 60 * 60 * 1000;
const within = (date: string, now: Date, days: number) => {
  const age = now.getTime() - Date.parse(date);
  return age >= 0 && age <= days * DAY;
};

/** Suggests a stage change from the log. The user always confirms. */
export function suggestStageChange(
  injury: Pick<Injury, 'stage' | 'stageSince'>,
  checkins: CheckinRecord[],
  logs: RehabLog[],
  now: Date,
): StageSuggestion {
  const recentCheckins = checkins.filter((entry) => within(entry.date, now, 14));
  const recentLogs = logs.filter((entry) => within(entry.date, now, 14));
  const previous = previousStage(injury.stage);
  const painful = checkins.some((entry) => within(entry.date, now, 7) && entry.score <= 2);
  if (previous && painful)
    return {
      action: 'regress',
      to: previous,
      reason: 'Check-in of 2 or lower this week. Drop back a stage and let it settle.',
    };
  const skipped = recentLogs.filter((entry) => !entry.completed).length;
  if (previous && skipped >= 2)
    return {
      action: 'regress',
      to: previous,
      reason: `Rehab not completed ${skipped} times in two weeks. Go back a stage and rebuild the habit.`,
    };
  const stageAge = now.getTime() - Date.parse(injury.stageSince);
  if (stageAge < 14 * DAY) return { action: 'none', reason: 'Less than two weeks in this stage.' };
  const ready =
    recentLogs.length >= 4 &&
    recentLogs.every((entry) => entry.completed && entry.easy) &&
    recentCheckins.length >= 3 &&
    recentCheckins.every((entry) => entry.score >= 4);
  if (!ready)
    return {
      action: 'none',
      reason: 'Needs two weeks of completed, easy rehab (4+ sessions) with check-ins of 4 or 5.',
    };
  const next = nextStage(injury.stage);
  if (!next)
    return {
      action: 'resolve',
      reason: 'Two weeks of easy rehab and check-ins of 4 or 5. Mark it recovered?',
    };
  return {
    action: 'advance',
    to: next,
    reason: 'Two weeks of completed, easy rehab and check-ins of 4 or 5.',
  };
}
