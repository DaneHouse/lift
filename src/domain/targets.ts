import {
  doubleProgression,
  linearProgression,
  timeProgression,
  type ProgressionTarget,
  type Unit,
  type WorkoutPerformance,
} from './progression';
import type { ExerciseMode } from './exercises';

export type ExercisePolicy = 'linear' | 'double' | 'time';
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
};

export const defaultIncrement = (unit: Unit) => (unit === 'kg' ? 2.5 : 5);

/** Plan used when an exercise is added without a routine: accessories double 8-12, holds by time. */
export function defaultPlanFor(mode: ExerciseMode, unit: Unit): ExercisePlan {
  if (mode !== 'reps')
    return { policy: 'time', sets: 3, repMin: 0, repMax: 0, increment: 5, seconds: 30 };
  return {
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
      policy: 'time',
      sets: item.sets,
      repMin: 0,
      repMax: 0,
      increment: 5,
      seconds: item.repMin,
    };
  if (item.role === 'compound')
    return {
      policy: 'linear',
      sets: item.sets,
      repMin: item.repMin,
      repMax: item.repMax,
      increment,
      seconds: 0,
    };
  return {
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

function advance(
  plan: ExercisePlan,
  target: ProgressionTarget,
  history: WorkoutPerformance[],
  unit: Unit,
): ProgressionTarget {
  if (plan.policy === 'linear')
    return linearProgression({
      weight: target.weight,
      reps: target.reps,
      sets: target.sets,
      increment: plan.increment,
      history,
      unit,
    });
  if (plan.policy === 'double')
    return doubleProgression({
      weight: target.weight,
      reps: target.reps,
      sets: target.sets,
      increment: plan.increment,
      history,
      unit,
      repMin: plan.repMin,
      repMax: plan.repMax,
    });
  return timeProgression({
    weight: 0,
    reps: 0,
    sets: target.sets,
    increment: plan.increment,
    history,
    unit,
    seconds: target.seconds ?? plan.seconds,
    secondsIncrement: plan.increment,
  });
}

/**
 * The next target for an exercise, derived only from its logged history (no stored counters).
 * The log is replayed session by session: each session is judged against the target it was
 * given. After a linear deload the 3-miss window restarts, so one bad block deloads once.
 */
export function nextTarget(
  plan: ExercisePlan,
  history: WorkoutPerformance[],
  unit: Unit,
): ProgressionTarget {
  if (!history.length) return startTarget(plan);
  let target: ProgressionTarget = {
    ...startTarget(plan),
    weight: history[0]?.sets[0]?.weight ?? 0,
    reason: '',
  };
  let windowStart = 0;
  history.forEach((_, index) => {
    const next = advance(plan, target, history.slice(windowStart, index + 1), unit);
    if (plan.policy === 'linear' && next.weight < target.weight) windowStart = index + 1;
    target = next;
  });
  return target;
}

/** One-line plan summary for lists, e.g. "3 × 8–12 · double · +5 lb · rest 90s". */
export function describePlan(plan: ExercisePlan, unit: Unit, restSeconds: number) {
  if (plan.policy === 'time')
    return `${plan.sets} × ${plan.seconds}s · +${plan.increment}s · rest ${restSeconds}s`;
  const range = plan.repMax !== plan.repMin ? `${plan.repMin}–${plan.repMax}` : `${plan.repMin}`;
  return `${plan.sets} × ${range} · ${plan.policy} · +${plan.increment} ${unit} · rest ${restSeconds}s`;
}
