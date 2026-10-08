import type { SQLiteDatabase } from 'expo-sqlite';
import { exerciseLibrary } from '@/data/exercises';
import { type ImportResult } from '@/domain/importExport';

/** Single-device owner until accounts exist (P4). Every row is written under this id. */
export const LOCAL_USER = 'local';

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

export function newId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const libraryByName = new Map(
  exerciseLibrary.map((exercise) => [exercise.name.toLowerCase(), exercise.id]),
);

/** Imported names that match the bundled library reuse its id; others become custom exercises. */
export function resolveExerciseId(name: string) {
  return libraryByName.get(name.toLowerCase()) ?? `custom-${slug(name) || 'exercise'}`;
}

export async function exportAllTables(database: SQLiteDatabase) {
  const tables: Record<string, unknown[]> = {};
  for (const table of EXPORT_TABLES)
    tables[table] = await database.getAllAsync(`SELECT * FROM ${table}`);
  return tables;
}

/**
 * Writes parsed import rows. Ids are derived from file content, so importing the
 * same file again is a no-op (OR IGNORE). Existing rows are never overwritten.
 */
export async function saveImport(database: SQLiteDatabase, result: ImportResult) {
  const now = new Date().toISOString();
  const workoutOrder = new Map<string, number>();
  let inserted = 0;
  await database.withTransactionAsync(async () => {
    for (const set of result.sets) {
      const exerciseId = resolveExerciseId(set.exerciseName);
      if (exerciseId.startsWith('custom-'))
        await database.runAsync(
          'INSERT OR IGNORE INTO custom_exercises (id,user_id,name,primary_muscles,secondary_muscles,instructions,updated_at) VALUES (?,?,?,?,?,?,?)',
          exerciseId,
          LOCAL_USER,
          set.exerciseName,
          '[]',
          '[]',
          '[]',
          now,
        );
      await database.runAsync(
        'INSERT OR IGNORE INTO workouts (id,user_id,name,started_at,completed_at,updated_at) VALUES (?,?,?,?,?,?)',
        set.workoutId,
        LOCAL_USER,
        set.workoutName,
        set.startedAt,
        set.startedAt,
        now,
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
        now,
      );
      inserted += write.changes;
    }
  });
  return { inserted, duplicates: result.sets.length - inserted, skipped: result.skipped };
}
