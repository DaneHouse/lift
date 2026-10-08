import type { SQLiteDatabase } from 'expo-sqlite';
import { LOCAL_USER, newId } from './common';
import { nextTarget, planExtras, type ExercisePlan, type ExercisePolicy } from '@/domain/targets';
import type { Unit, WorkoutPerformance } from '@/domain/progression';
import type { SessionExercise } from '@/domain/session';

/** Completed, non-warmup sets for one exercise, one entry per workout, oldest first. */
export async function exerciseHistory(
  database: SQLiteDatabase,
  exerciseId: string,
): Promise<WorkoutPerformance[]> {
  const rows = await database.getAllAsync<{
    workout_id: string;
    started_at: string;
    weight: number | null;
    reps: number | null;
    seconds: number | null;
    rir: number | null;
  }>(
    `SELECT ws.workout_id, w.started_at, ws.weight, ws.reps, ws.seconds, ws.rir
     FROM workout_sets ws JOIN workouts w ON w.id = ws.workout_id
     WHERE ws.user_id = ? AND ws.exercise_id = ? AND ws.done = 1 AND ws.warmup = 0
       AND ws.deleted_at IS NULL AND w.deleted_at IS NULL AND w.completed_at IS NOT NULL
     ORDER BY w.started_at ASC, w.id ASC, ws.sort_order ASC`,
    LOCAL_USER,
    exerciseId,
  );
  const byWorkout = new Map<string, WorkoutPerformance>();
  for (const row of rows) {
    const entry = byWorkout.get(row.workout_id) ?? { date: row.started_at, sets: [] };
    entry.sets.push({
      weight: row.weight ?? 0,
      reps: row.reps ?? undefined,
      seconds: row.seconds ?? undefined,
      rir: row.rir ?? undefined,
      completed: true,
    });
    byWorkout.set(row.workout_id, entry);
  }
  return [...byWorkout.values()];
}

export type PlanRow = {
  policy: string;
  sets: number;
  rep_min: number | null;
  rep_max: number | null;
  increment: number;
  seconds: number | null;
  target_rir: number | null;
  backoff_percent: number | null;
  training_max: number | null;
  deload_every: number;
};

export const PLAN_COLUMNS =
  'sets, rep_min, rep_max, seconds, policy, increment, target_rir, backoff_percent, training_max, deload_every';

const policies: ExercisePolicy[] = [
  'linear',
  'double',
  'time',
  'rir',
  'top-backoff',
  '531',
  'bodyweight',
];

export function planFromRow(row: PlanRow): ExercisePlan {
  const policy: ExercisePolicy = policies.find((value) => value === row.policy) ?? 'double';
  return {
    policy,
    sets: row.sets,
    repMin: row.rep_min ?? 8,
    repMax: row.rep_max ?? row.rep_min ?? 8,
    increment: row.increment,
    seconds: row.seconds ?? 30,
    targetRir: row.target_rir ?? planExtras.targetRir,
    backoffPercent: row.backoff_percent ?? planExtras.backoffPercent,
    trainingMax: row.training_max ?? planExtras.trainingMax,
    deloadEvery: row.deload_every,
  };
}

/** Column values for a plan. Time plans store seconds; rep plans store the rep range. */
export function rowFromPlan(plan: ExercisePlan) {
  const timed = plan.policy === 'time';
  return {
    policy: plan.policy,
    sets: plan.sets,
    rep_min: timed ? null : plan.repMin,
    rep_max: timed ? null : plan.repMax,
    increment: plan.increment,
    seconds: timed ? plan.seconds : null,
    target_rir: plan.targetRir,
    backoff_percent: plan.backoffPercent,
    training_max: plan.trainingMax,
    deload_every: plan.deloadEvery,
  };
}

/** Builds one session slot: its target comes from the engine applied to the exercise's own history. */
export async function buildSessionExercise(
  database: SQLiteDatabase,
  input: {
    slotId: string;
    exercise: { id: string; name: string };
    plan: ExercisePlan;
    restSeconds: number;
    unit: Unit;
  },
): Promise<SessionExercise> {
  const { plan, unit } = input;
  const history = await exerciseHistory(database, input.exercise.id);
  const target = nextTarget(plan, history, unit);
  const timed = plan.policy === 'time';
  return {
    slotId: input.slotId,
    id: input.exercise.id,
    name: input.exercise.name,
    reason: target.reason,
    restSeconds: input.restSeconds,
    kind: timed ? 'time' : 'reps',
    plan,
    sets: Array.from({ length: target.sets }, (_, index) => ({
      id: newId('set'),
      weight:
        index > 0 && target.backoffWeight !== undefined ? target.backoffWeight : target.weight,
      reps: target.reps,
      seconds: timed ? target.seconds : undefined,
      targetReps: target.reps,
      done: false,
    })),
  };
}
