import type { SQLiteDatabase } from 'expo-sqlite';
import { exerciseLibrary } from '@/data/exercises';
import { type ImportResult, type Unit } from '@/domain/importExport';
import { type HistoryWorkout } from '@/domain/history';
import {
  fitSessionLength,
  type ScheduledRoutine,
  type StarterTemplate,
  type TemplateExercise,
} from '@/domain/plans';
import { modeFor, type ExerciseMode } from '@/domain/exercises';
import { defaultPlateSetup, type PlateSetup } from '@/domain/plates';
import { type SessionExercise, type SessionSet } from '@/domain/session';
import { defaultPlanFor, planForTemplateItem, type ExercisePlan } from '@/domain/targets';
import { LOCAL_USER, now, newId } from './common';
import { buildSessionExercise, planFromRow, rowFromPlan, type PlanRow } from './targets';
import { getExercise } from './library';
import { getSetting, setSetting } from './settings';

export { getSetting, setSetting } from './settings';

export { LOCAL_USER } from './common';

export const EXPORT_TABLES = [
  'profiles',
  'custom_exercises',
  'exercise_refs',
  'routines',
  'routine_items',
  'schedules',
  'workouts',
  'workout_sets',
  'bodyweight',
  'injuries',
  'injury_checkins',
  'health_daily',
  'coach_threads',
  'coach_proposals',
  'settings',
  'progress_photos',
] as const;

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const libraryByName = new Map(
  exerciseLibrary.map((exercise) => [exercise.name.toLowerCase(), exercise.id]),
);
const libraryById = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));

/** Imported names that match the bundled library reuse its id; others become custom exercises. */
export function resolveExerciseId(name: string) {
  return libraryByName.get(name.toLowerCase()) ?? `custom-${slug(name) || 'exercise'}`;
}

/** Writes a custom exercise row if the id is not in the bundled library. Idempotent. */
async function ensureExercise(database: SQLiteDatabase, id: string, name: string) {
  if (libraryById.has(id)) return;
  await database.runAsync(
    'INSERT OR IGNORE INTO custom_exercises (id,user_id,name,primary_muscles,secondary_muscles,instructions,updated_at) VALUES (?,?,?,?,?,?,?)',
    id,
    LOCAL_USER,
    name,
    '[]',
    '[]',
    '[]',
    now(),
  );
}

export async function exerciseInfo(database: SQLiteDatabase, id: string) {
  const library = libraryById.get(id);
  if (library) return { name: library.name, muscle: library.primaryMuscles[0] ?? 'other' };
  const custom = await database.getFirstAsync<{ name: string }>(
    'SELECT name FROM custom_exercises WHERE id = ?',
    id,
  );
  return { name: custom?.name ?? id, muscle: 'other' };
}

export async function exportAllTables(database: SQLiteDatabase) {
  const tables: Record<string, unknown[]> = {};
  for (const table of EXPORT_TABLES)
    tables[table] = await database.getAllAsync(`SELECT * FROM ${table}`);
  return tables;
}

// ---- profile and settings -------------------------------------------------

export type Profile = { unit: Unit; sessionMinutes: 45 | 60 | 75 | 90 };

export async function getProfile(database: SQLiteDatabase): Promise<Profile> {
  const row = await database.getFirstAsync<{ unit: Unit; session_length: number }>(
    'SELECT unit, session_length FROM profiles WHERE id = ? AND deleted_at IS NULL',
    LOCAL_USER,
  );
  const minutes = row?.session_length;
  return {
    unit: row?.unit ?? 'lb',
    sessionMinutes: minutes === 45 || minutes === 75 || minutes === 90 ? minutes : 60,
  };
}

export async function updateProfile(database: SQLiteDatabase, patch: Partial<Profile>) {
  const current = await getProfile(database);
  const next = { ...current, ...patch };
  await database.runAsync(
    'INSERT INTO profiles (id,user_id,unit,session_length,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET unit = excluded.unit, session_length = excluded.session_length, updated_at = excluded.updated_at',
    LOCAL_USER,
    LOCAL_USER,
    next.unit,
    next.sessionMinutes,
    now(),
  );
}

// ---- rest and plates --------------------------------------------------------

export const DEFAULT_REST_SECONDS = 90;

/** Global default rest. Used for exercises added without a routine item (library add, swap). */
export async function getRestDefault(database: SQLiteDatabase) {
  const value = await getSetting<number>(database, 'restDefault');
  return typeof value === 'number' && value > 0 ? value : DEFAULT_REST_SECONDS;
}

export async function setRestDefault(database: SQLiteDatabase, seconds: number) {
  await setSetting(database, 'restDefault', seconds);
}

export async function getPlateSetup(database: SQLiteDatabase, unit: Unit): Promise<PlateSetup> {
  const stored = await getSetting<PlateSetup>(database, `plates.${unit}`);
  return stored ?? defaultPlateSetup(unit);
}

export async function savePlateSetup(database: SQLiteDatabase, unit: Unit, setup: PlateSetup) {
  await setSetting(database, `plates.${unit}`, setup);
}

// ---- bodyweight -----------------------------------------------------------

export type BodyweightEntry = { id: string; measuredAt: string; weight: number; unit: Unit };

export async function listBodyweight(database: SQLiteDatabase): Promise<BodyweightEntry[]> {
  const rows = await database.getAllAsync<{
    id: string;
    measured_at: string;
    weight: number;
    unit: Unit;
  }>(
    'SELECT id, measured_at, weight, unit FROM bodyweight WHERE user_id = ? AND deleted_at IS NULL ORDER BY measured_at ASC, rowid ASC',
    LOCAL_USER,
  );
  return rows.map((row) => ({
    id: row.id,
    measuredAt: row.measured_at,
    weight: row.weight,
    unit: row.unit,
  }));
}

export async function addBodyweight(database: SQLiteDatabase, weight: number, unit: Unit) {
  const stamp = now();
  await database.runAsync(
    'INSERT INTO bodyweight (id,user_id,measured_at,weight,unit,goal,updated_at) VALUES (?,?,?,?,?,NULL,?)',
    newId('bw'),
    LOCAL_USER,
    stamp,
    weight,
    unit,
    stamp,
  );
}

// ---- session draft (in-flight workout) ------------------------------------

export type DraftSet = SessionSet;
export type DraftExercise = SessionExercise;
export type SessionDraft = {
  /** ISO time the rest timer ends. Stored, not ticked, so it survives backgrounding and restarts. */
  restEndsAt?: string | undefined;
  workoutId: string;
  routineId?: string | undefined;
  name: string;
  startedAt: string;
  notes: string;
  exercises: DraftExercise[];
};

/**
 * The in-flight session lives in one settings row so reason text and rest times survive
 * a restart. Finishing it writes normalised rows to workouts and workout_sets.
 */
export async function loadDraft(database: SQLiteDatabase) {
  return getSetting<SessionDraft>(database, 'activeSession');
}

export async function saveDraft(database: SQLiteDatabase, draft: SessionDraft | null) {
  await setSetting(database, 'activeSession', draft);
}

export async function finishDraft(database: SQLiteDatabase, draft: SessionDraft) {
  const completedAt = now();
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      'INSERT OR REPLACE INTO workouts (id,user_id,routine_id,name,started_at,completed_at,notes,updated_at) VALUES (?,?,?,?,?,?,?,?)',
      draft.workoutId,
      LOCAL_USER,
      draft.routineId ?? null,
      draft.name,
      draft.startedAt,
      completedAt,
      draft.notes || null,
      completedAt,
    );
    let order = 0;
    for (const exercise of draft.exercises) {
      await ensureExercise(database, exercise.id, exercise.name);
      for (const set of exercise.sets) {
        if (!set.done) continue;
        const timed = exercise.kind === 'time';
        await database.runAsync(
          'INSERT INTO workout_sets (id,user_id,workout_id,exercise_id,weight,reps,seconds,rir,done,warmup,set_type,sort_order,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
          newId('set'),
          LOCAL_USER,
          draft.workoutId,
          exercise.id,
          set.weight,
          timed ? 0 : set.reps,
          timed ? (set.seconds ?? null) : null,
          set.rir ?? null,
          1,
          set.setType === 'warmup' ? 1 : 0,
          set.setType ?? 'normal',
          order,
          completedAt,
        );
        order += 1;
      }
    }
    await saveDraft(database, null);
  });
}

export async function listCompletedWorkouts(database: SQLiteDatabase): Promise<HistoryWorkout[]> {
  const workouts = await database.getAllAsync<{ id: string; started_at: string }>(
    'SELECT id, started_at FROM workouts WHERE user_id = ? AND completed_at IS NOT NULL AND deleted_at IS NULL ORDER BY started_at ASC',
    LOCAL_USER,
  );
  const sets = await database.getAllAsync<{
    workout_id: string;
    exercise_id: string;
    weight: number | null;
    reps: number | null;
  }>(
    'SELECT workout_id, exercise_id, weight, reps FROM workout_sets WHERE user_id = ? AND done = 1 AND deleted_at IS NULL ORDER BY sort_order ASC',
    LOCAL_USER,
  );
  const infoCache = new Map<string, Awaited<ReturnType<typeof exerciseInfo>>>();
  const setsByWorkout = new Map<string, HistoryWorkout['sets']>();
  for (const set of sets) {
    if (!infoCache.has(set.exercise_id))
      infoCache.set(set.exercise_id, await exerciseInfo(database, set.exercise_id));
    const info = infoCache.get(set.exercise_id)!;
    const bucket = setsByWorkout.get(set.workout_id) ?? [];
    bucket.push({
      exerciseId: set.exercise_id,
      exerciseName: info.name,
      muscle: info.muscle,
      weight: set.weight ?? 0,
      reps: set.reps ?? 0,
      done: true,
    });
    setsByWorkout.set(set.workout_id, bucket);
  }
  return workouts.map((workout) => ({
    id: workout.id,
    date: workout.started_at,
    sets: setsByWorkout.get(workout.id) ?? [],
  }));
}

// ---- plans ----------------------------------------------------------------

const restFor: Record<TemplateExercise['role'], number> = {
  compound: 150,
  accessory: 90,
  'core-rehab': 60,
};

export type ActivePlanDay = { routineId: string; name: string; exerciseCount: number };

/**
 * Replaces the active plan with one routine per template day on a rotation.
 * Previously active routines are soft-deleted, not removed.
 */
export async function saveActivePlan(
  database: SQLiteDatabase,
  template: StarterTemplate,
  minutes: 45 | 60 | 75 | 90,
) {
  const stamp = now();
  const { unit } = await getProfile(database);
  await database.withTransactionAsync(async () => {
    const previous = await database.getAllAsync<{ id: string }>(
      'SELECT id FROM routines WHERE user_id = ? AND template_key IS NOT NULL AND deleted_at IS NULL',
      LOCAL_USER,
    );
    for (const { id } of previous) {
      await database.runAsync(
        'UPDATE routines SET deleted_at = ?, updated_at = ? WHERE id = ?',
        stamp,
        stamp,
        id,
      );
      await database.runAsync(
        'UPDATE routine_items SET deleted_at = ?, updated_at = ? WHERE routine_id = ?',
        stamp,
        stamp,
        id,
      );
      await database.runAsync(
        'UPDATE schedules SET deleted_at = ?, updated_at = ? WHERE routine_id = ?',
        stamp,
        stamp,
        id,
      );
    }
    for (const [dayIndex, day] of template.days.entries()) {
      const routineId = newId('routine');
      await database.runAsync(
        'INSERT INTO routines (id,user_id,name,notes,template_key,updated_at) VALUES (?,?,?,?,?,?)',
        routineId,
        LOCAL_USER,
        `${template.name} · Day ${dayIndex + 1}`,
        null,
        template.id,
        stamp,
      );
      await database.runAsync(
        'INSERT INTO schedules (id,user_id,routine_id,mode,weekday,rotation_order,updated_at) VALUES (?,?,?,?,?,?,?)',
        newId('sched'),
        LOCAL_USER,
        routineId,
        'rotation',
        null,
        dayIndex,
        stamp,
      );
      for (const [order, item] of fitSessionLength(day, minutes).entries()) {
        const exerciseId = resolveExerciseId(item.name);
        await ensureExercise(database, exerciseId, item.name);
        const plan = planForTemplateItem(item, modeFor(item.name), unit);
        await insertRoutineItem(database, {
          routineId,
          exerciseId,
          plan,
          restSeconds: restFor[item.role],
          order,
          stamp,
        });
      }
    }
  });
}

export async function loadActivePlan(database: SQLiteDatabase) {
  const days = await database.getAllAsync<{ id: string; name: string; rotation_order: number }>(
    `SELECT r.id, r.name, s.rotation_order FROM routines r
     JOIN schedules s ON s.routine_id = r.id AND s.deleted_at IS NULL
     WHERE r.user_id = ? AND r.template_key IS NOT NULL AND r.deleted_at IS NULL
     ORDER BY s.rotation_order ASC`,
    LOCAL_USER,
  );
  const completed = await database.getAllAsync<{ routine_id: string }>(
    'SELECT routine_id FROM workouts WHERE user_id = ? AND routine_id IS NOT NULL AND completed_at IS NOT NULL AND deleted_at IS NULL ORDER BY started_at ASC',
    LOCAL_USER,
  );
  const schedule: ScheduledRoutine[] = days.map((day) => ({
    id: day.id,
    mode: 'rotation',
    rotationOrder: day.rotation_order,
  }));
  const planDays: ActivePlanDay[] = [];
  for (const day of days) {
    const count = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM routine_items WHERE routine_id = ? AND deleted_at IS NULL',
      day.id,
    );
    planDays.push({ routineId: day.id, name: day.name, exerciseCount: count?.count ?? 0 });
  }
  return {
    days: planDays,
    schedule,
    completedRoutineIds: completed.map((row) => row.routine_id),
  };
}

export type RoutineItem = {
  id: string;
  exerciseId: string;
  name: string;
  mode: ReturnType<typeof modeFor>;
  plan: ExercisePlan;
  restSeconds: number;
  order: number;
};

type ItemRow = PlanRow & {
  id: string;
  exercise_id: string;
  rest_seconds: number;
  sort_order: number;
};

const itemFromRow = (row: ItemRow, name: string, mode: RoutineItem['mode']): RoutineItem => ({
  id: row.id,
  exerciseId: row.exercise_id,
  name,
  mode,
  plan: planFromRow(row),
  restSeconds: row.rest_seconds,
  order: row.sort_order,
});

export async function listRoutineItems(
  database: SQLiteDatabase,
  routineId: string,
): Promise<RoutineItem[]> {
  const rows = await database.getAllAsync<ItemRow>(
    'SELECT id, exercise_id, sets, rep_min, rep_max, seconds, policy, increment, rest_seconds, sort_order FROM routine_items WHERE routine_id = ? AND deleted_at IS NULL ORDER BY sort_order ASC',
    routineId,
  );
  const items: RoutineItem[] = [];
  for (const row of rows) {
    const exercise = await getExercise(database, row.exercise_id);
    items.push(itemFromRow(row, exercise?.name ?? row.exercise_id, exercise?.mode ?? 'reps'));
  }
  return items;
}

export async function insertRoutineItem(
  database: SQLiteDatabase,
  input: {
    routineId: string;
    exerciseId: string;
    plan: ExercisePlan;
    restSeconds: number;
    order: number;
    stamp?: string;
  },
) {
  const values = rowFromPlan(input.plan);
  await database.runAsync(
    'INSERT INTO routine_items (id,user_id,routine_id,exercise_id,sets,reps,rep_min,rep_max,seconds,policy,increment,rest_seconds,superset_group,set_type,sort_order,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    newId('item'),
    LOCAL_USER,
    input.routineId,
    input.exerciseId,
    values.sets,
    null,
    values.rep_min,
    values.rep_max,
    values.seconds,
    values.policy,
    values.increment,
    input.restSeconds,
    null,
    'normal',
    input.order,
    input.stamp ?? now(),
  );
}

/** Saves the plan editor's changes for one routine item. Takes effect at the next session's target. */
export async function saveRoutineItem(
  database: SQLiteDatabase,
  itemId: string,
  plan: ExercisePlan,
  restSeconds: number,
) {
  const values = rowFromPlan(plan);
  await database.runAsync(
    'UPDATE routine_items SET sets = ?, rep_min = ?, rep_max = ?, seconds = ?, policy = ?, increment = ?, rest_seconds = ?, updated_at = ? WHERE id = ?',
    values.sets,
    values.rep_min,
    values.rep_max,
    values.seconds,
    values.policy,
    values.increment,
    restSeconds,
    now(),
    itemId,
  );
}

/** Adds an exercise to the end of a plan day with the default plan and the global rest default. */
export async function addExerciseToRoutine(
  database: SQLiteDatabase,
  routineId: string,
  exerciseId: string,
  mode: ExerciseMode,
  unit: Unit,
) {
  const last = await database.getFirstAsync<{ last: number | null }>(
    'SELECT MAX(sort_order) AS last FROM routine_items WHERE routine_id = ? AND deleted_at IS NULL',
    routineId,
  );
  await insertRoutineItem(database, {
    routineId,
    exerciseId,
    plan: defaultPlanFor(mode, unit),
    restSeconds: await getRestDefault(database),
    order: (last?.last ?? -1) + 1,
  });
}

export async function removeRoutineItem(database: SQLiteDatabase, itemId: string) {
  const stamp = now();
  await database.runAsync(
    'UPDATE routine_items SET deleted_at = ?, updated_at = ? WHERE id = ?',
    stamp,
    stamp,
    itemId,
  );
}

export async function getPlanDay(database: SQLiteDatabase, routineId: string) {
  return database.getFirstAsync<{ name: string }>(
    'SELECT name FROM routines WHERE id = ? AND deleted_at IS NULL',
    routineId,
  );
}

/**
 * Builds a session draft from a saved routine. Each slot's target is the progression engine
 * applied to that exercise's own logged history, so finished sessions feed the next target.
 */
export async function draftFromRoutine(
  database: SQLiteDatabase,
  routineId: string,
  name: string,
  unit: Unit,
): Promise<SessionDraft> {
  const items = await listRoutineItems(database, routineId);
  const exercises: DraftExercise[] = [];
  for (const item of items) {
    exercises.push(
      await buildSessionExercise(database, {
        slotId: newId('slot'),
        exercise: { id: item.exerciseId, name: item.name },
        plan: item.plan,
        restSeconds: item.restSeconds,
        unit,
      }),
    );
  }
  return {
    workoutId: newId('workout'),
    routineId,
    name,
    startedAt: now(),
    notes: '',
    exercises,
  };
}

// ---- imports --------------------------------------------------------------

/**
 * Writes parsed import rows. Ids are derived from file content, so importing the
 * same file again is a no-op (OR IGNORE). Existing rows are never overwritten.
 */
export async function saveImport(database: SQLiteDatabase, result: ImportResult) {
  const stamp = now();
  const workoutOrder = new Map<string, number>();
  let inserted = 0;
  await database.withTransactionAsync(async () => {
    for (const set of result.sets) {
      const exerciseId = resolveExerciseId(set.exerciseName);
      await ensureExercise(database, exerciseId, set.exerciseName);
      await database.runAsync(
        'INSERT OR IGNORE INTO workouts (id,user_id,name,started_at,completed_at,updated_at) VALUES (?,?,?,?,?,?)',
        set.workoutId,
        LOCAL_USER,
        set.workoutName,
        set.startedAt,
        set.startedAt,
        stamp,
      );
      const order = workoutOrder.get(set.workoutId) ?? 0;
      workoutOrder.set(set.workoutId, order + 1);
      const write = await database.runAsync(
        'INSERT OR IGNORE INTO workout_sets (id,user_id,workout_id,exercise_id,weight,reps,seconds,rir,done,warmup,set_type,sort_order,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        set.id,
        LOCAL_USER,
        set.workoutId,
        exerciseId,
        set.weight,
        set.reps,
        set.seconds ?? null,
        set.rir ?? null,
        1,
        set.setType === 'warmup' ? 1 : 0,
        set.setType,
        order,
        stamp,
      );
      inserted += write.changes;
    }
  });
  return { inserted, duplicates: result.sets.length - inserted, skipped: result.skipped };
}
