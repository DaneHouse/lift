import {
  bodyweightProgression,
  doubleProgression,
  linearProgression,
  rirProgression,
  timeProgression,
  topSetBackoffs,
  wave531,
  type ProgressionTarget,
  type Unit,
  type WorkoutPerformance,
} from './progression';
import type { ExerciseMode } from './exercises';

export type ExercisePolicy =
  | 'linear'
  | 'double'
  | 'time'
  | 'rir'
  | 'top-backoff'
  | '531'
  | 'bodyweight';

/** Bodyweight work adds sets after the rep ceiling, up to this many. */
export const BODYWEIGHT_MAX_SETS = 5;
export type TemplateRole = 'compound' | 'accessory' | 'core-rehab';

/** Everything the engine needs to turn an exercise's history into its next target. */
export type ExercisePlan = {
  policy: ExercisePolicy;
  sets: number;
  repMin: number;
  repMax: number;
  /** Weight step for linear and double; seconds added on a held time target. */
  increment: number;
  /** Hold length for the time policy. */
  seconds: number;
  /** Reps in reserve the rir policy steers toward. */
  targetRir: number;
  /** Fraction taken off the top set for back-offs, e.g. 0.1. */
  backoffPercent: number;
  /** Training max for the 5/3/1 wave. */
  trainingMax: number;
  /** Every Nth week (counted from the first logged session) is a deload week. 0 = never. */
  deloadEvery: number;
};

export const planExtras = {
  targetRir: 2,
  backoffPercent: 0.1,
  trainingMax: 0,
  deloadEvery: 0,
} as const;

export const defaultIncrement = (unit: Unit) => (unit === 'kg' ? 2.5 : 5);

/** Plan used when an exercise is added without a routine: accessories double 8-12, holds by time. */
export function defaultPlanFor(mode: ExerciseMode, unit: Unit): ExercisePlan {
  if (mode !== 'reps')
    return {
      ...planExtras,
      policy: 'time',
      sets: 3,
      repMin: 0,
      repMax: 0,
      increment: 5,
      seconds: 30,
    };
  return {
    ...planExtras,
    policy: 'double',
    sets: 3,
    repMin: 8,
    repMax: 12,
    increment: defaultIncrement(unit),
    seconds: 0,
  };
}

/** SPEC 3.2 defaults for a starter template entry: compounds linear, accessories double, holds time. */
export function planForTemplateItem(
  item: { sets: number; repMin: number; repMax: number; role: TemplateRole },
  mode: ExerciseMode,
  unit: Unit,
): ExercisePlan {
  const increment = defaultIncrement(unit);
  if (mode !== 'reps')
    return {
      ...planExtras,
      policy: 'time',
      sets: item.sets,
      repMin: 0,
      repMax: 0,
      increment: 5,
      seconds: item.repMin,
    };
  if (item.role === 'compound')
    return {
      ...planExtras,
      policy: 'linear',
      sets: item.sets,
      repMin: item.repMin,
      repMax: item.repMax,
      increment,
      seconds: 0,
    };
  return {
    ...planExtras,
    policy: 'double',
    sets: item.sets,
    repMin: item.repMin,
    repMax: item.repMax,
    increment,
    seconds: 0,
  };
}

/**
 * Plan for a slot that was swapped to a different exercise. Keeps the slot's set count and,
 * where the kind of exercise is the same, its rep range or hold length.
 */
export function swapPlan(previous: ExercisePlan, mode: ExerciseMode, unit: Unit): ExercisePlan {
  const timed = mode !== 'reps';
  if (timed === (previous.policy === 'time')) return previous;
  return { ...defaultPlanFor(mode, unit), sets: previous.sets };
}

function startTarget(plan: ExercisePlan): ProgressionTarget {
  if (plan.policy === 'time')
    return {
      weight: 0,
      reps: 0,
      sets: plan.sets,
      seconds: plan.seconds,
      reason: `Plan ${plan.sets}×${plan.seconds}s · no history yet`,
    };
  const range = plan.repMax !== plan.repMin ? `${plan.repMin}–${plan.repMax}` : `${plan.repMin}`;
  return {
    weight: 0,
    reps: plan.repMin,
    sets: plan.sets,
    reason: `Plan ${plan.sets}×${range} · no history yet`,
  };
}

const WAVE_LENGTH = 4;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Zero-based week of `date` counted from the first logged session. */
function weekIndex(firstDate: string, date: Date) {
  const start = Date.parse(firstDate);
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((date.getTime() - start) / (7 * DAY_MS)));
}

/** With deloadEvery = 4, weeks 4, 8, 12 ... (counted from the first session) are deload weeks. */
export function isDeloadWeek(plan: ExercisePlan, firstDate: string | undefined, date: Date) {
  if (plan.deloadEvery <= 0 || !firstDate) return false;
  const week = weekIndex(firstDate, date);
  return week > 0 && (week + 1) % plan.deloadEvery === 0;
}

const roundTo = (value: number, step: number) =>
  step > 0 ? Math.round(value / step) * step : value;

function wavePlan(plan: ExercisePlan, completedSessions: number, unit: Unit): ProgressionTarget {
  const cycles = Math.floor(completedSessions / WAVE_LENGTH);
  const week = ((completedSessions % WAVE_LENGTH) + 1) as 1 | 2 | 3 | 4;
  const trainingMax = plan.trainingMax + cycles * plan.increment;
  const target = wave531({
    weight: 0,
    reps: 0,
    sets: plan.sets,
    increment: plan.increment,
    trainingMax,
    week,
    unit,
  });
  return {
    ...target,
    reason: `${target.reason} (${trainingMax} ${unit})`,
  };
}

function advance(
  plan: ExercisePlan,
  target: ProgressionTarget,
  history: WorkoutPerformance[],
  unit: Unit,
  deloadWeek = false,
): ProgressionTarget {
  const base = {
    weight: target.weight,
    reps: target.reps,
    sets: target.sets,
    increment: plan.increment,
    history,
    unit,
  };
  if (plan.policy === 'linear') return linearProgression({ ...base, deloadWeek });
  if (plan.policy === 'double')
    return doubleProgression({
      ...base,
      deloadWeek,
      repMin: plan.repMin,
      repMax: plan.repMax,
    });
  if (plan.policy === 'rir') return rirProgression({ ...base, targetRir: plan.targetRir });
  if (plan.policy === 'top-backoff')
    return topSetBackoffs({ ...base, backoffPercent: plan.backoffPercent });
  if (plan.policy === 'bodyweight')
    return bodyweightProgression({
      reps: target.reps,
      sets: target.sets,
      increment: plan.increment,
      history,
      unit,
      repsMax: plan.repMax,
      setsMax: BODYWEIGHT_MAX_SETS,
    });
  return timeProgression({
    ...base,
    weight: 0,
    reps: 0,
    seconds: target.seconds ?? plan.seconds,
    secondsIncrement: plan.increment,
  });
}

/** Deload for policies whose progression function has no deload switch of its own. */
function deloaded(plan: ExercisePlan, target: ProgressionTarget): ProgressionTarget {
  if (plan.policy === 'bodyweight')
    return {
      ...target,
      sets: Math.max(1, target.sets - 1),
      reason: 'Deload week → one set fewer',
    };
  return {
    ...target,
    weight: roundTo(target.weight * 0.9, plan.increment),
    backoffWeight:
      target.backoffWeight === undefined
        ? undefined
        : roundTo(target.backoffWeight * 0.9, plan.increment),
    reason: 'Deload week → -10%',
  };
}

/**
 * The next target for an exercise, derived only from its logged history (no stored counters).
 * The log is replayed session by session: each session is judged against the target it was
 * given. After a linear deload the 3-miss window restarts, so one bad block deloads once.
 * Sessions logged in a deload week do not move the target; a deload week today lowers it
 * for that session only.
 */
export function nextTarget(
  plan: ExercisePlan,
  history: WorkoutPerformance[],
  unit: Unit,
  today: Date = new Date(),
): ProgressionTarget {
  if (plan.policy === '531') return wavePlan(plan, history.length, unit);
  if (!history.length) return startTarget(plan);
  const firstDate = history[0]?.date;
  let target: ProgressionTarget = {
    ...startTarget(plan),
    weight: history[0]?.sets[0]?.weight ?? 0,
    reason: '',
  };
  let windowStart = 0;
  history.forEach((session, index) => {
    if (plan.policy !== 'time' && isDeloadWeek(plan, firstDate, new Date(session.date))) return;
    const next = advance(plan, target, history.slice(windowStart, index + 1), unit);
    if (plan.policy === 'linear' && next.weight < target.weight) windowStart = index + 1;
    target = next;
  });
  if (plan.policy !== 'time' && isDeloadWeek(plan, firstDate, today)) {
    // linear and double carry their own deload rule; the rest use the shared -10%.
    if (plan.policy === 'linear' || plan.policy === 'double')
      return advance(plan, target, history.slice(windowStart), unit, true);
    return deloaded(plan, target);
  }
  return target;
}

const policyLabel: Record<ExercisePolicy, string> = {
  linear: 'linear',
  double: 'double',
  time: 'time',
  rir: 'RIR',
  'top-backoff': 'top set + back-offs',
  '531': '5/3/1 wave',
  bodyweight: 'bodyweight',
};

/** One-line plan summary for lists, e.g. "3 × 8–12 · double · +5 lb · rest 90s". */
export function describePlan(plan: ExercisePlan, unit: Unit, restSeconds: number) {
  const deload = plan.deloadEvery > 0 ? ` · deload every ${plan.deloadEvery} wk` : '';
  if (plan.policy === 'time')
    return `${plan.sets} × ${plan.seconds}s · +${plan.increment}s · rest ${restSeconds}s`;
  if (plan.policy === '531')
    return `${plan.sets} sets · 5/3/1 wave · TM ${plan.trainingMax} ${unit} · rest ${restSeconds}s`;
  const range = plan.repMax !== plan.repMin ? `${plan.repMin}–${plan.repMax}` : `${plan.repMin}`;
  const step = plan.policy === 'bodyweight' ? '' : ` · +${plan.increment} ${unit}`;
  const extra =
    plan.policy === 'rir'
      ? ` · RIR ${plan.targetRir}`
      : plan.policy === 'top-backoff'
        ? ` · back-off -${Math.round(plan.backoffPercent * 100)}%`
        : '';
  return `${plan.sets} × ${range} · ${policyLabel[plan.policy]}${step}${extra}${deload} · rest ${restSeconds}s`;
}
