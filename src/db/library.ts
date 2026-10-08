import type { SQLiteDatabase } from 'expo-sqlite';
import { exerciseLibrary } from '@/data/exercises';
import { modeFor, type ExerciseMode } from '@/domain/exercises';
import { LOCAL_USER, newId, now } from './common';
import { getSetting, setSetting } from './settings';

export type ExerciseRecord = {
  id: string;
  name: string;
  mode: ExerciseMode;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  instructions: string[];
  custom: boolean;
};

const libraryById = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));

/** Library or custom exercise by id. Custom rows are returned even after soft delete so history keeps its name. */
export async function getExercise(
  database: SQLiteDatabase,
  id: string,
): Promise<ExerciseRecord | null> {
  const library = libraryById.get(id);
  if (library)
    return {
      id,
      name: library.name,
      mode: modeFor(library.name, library.category),
      primaryMuscles: library.primaryMuscles,
      secondaryMuscles: library.secondaryMuscles,
      equipment: library.equipment,
      instructions: library.instructions,
      custom: false,
    };
  const row = await database.getFirstAsync<{
    name: string;
    mode: ExerciseMode;
    primary_muscles: string;
    secondary_muscles: string;
    equipment: string | null;
    instructions: string;
  }>(
    'SELECT name, mode, primary_muscles, secondary_muscles, equipment, instructions FROM custom_exercises WHERE id = ?',
    id,
  );
  if (!row) return null;
  return {
    id,
    name: row.name,
    mode: row.mode,
    primaryMuscles: JSON.parse(row.primary_muscles) as string[],
    secondaryMuscles: JSON.parse(row.secondary_muscles) as string[],
    equipment: row.equipment ?? '',
    instructions: JSON.parse(row.instructions) as string[],
    custom: true,
  };
}

// ---- browsing ---------------------------------------------------------------

const libraryRecords: ExerciseRecord[] = exerciseLibrary.map((exercise) => ({
  id: exercise.id,
  name: exercise.name,
  mode: modeFor(exercise.name, exercise.category),
  primaryMuscles: exercise.primaryMuscles,
  secondaryMuscles: exercise.secondaryMuscles,
  equipment: exercise.equipment,
  instructions: exercise.instructions,
  custom: false,
}));

/** Bundled library followed by the user's live custom exercises. Soft-deleted customs are hidden. */
export async function listAllExercises(database: SQLiteDatabase): Promise<ExerciseRecord[]> {
  const rows = await database.getAllAsync<{
    id: string;
    name: string;
    mode: ExerciseMode;
    primary_muscles: string;
    secondary_muscles: string;
    equipment: string | null;
    instructions: string;
  }>(
    'SELECT id, name, mode, primary_muscles, secondary_muscles, equipment, instructions FROM custom_exercises WHERE user_id = ? AND deleted_at IS NULL ORDER BY name COLLATE NOCASE',
    LOCAL_USER,
  );
  const custom = rows.map<ExerciseRecord>((row) => ({
    id: row.id,
    name: row.name,
    mode: row.mode,
    primaryMuscles: JSON.parse(row.primary_muscles) as string[],
    secondaryMuscles: JSON.parse(row.secondary_muscles) as string[],
    equipment: row.equipment ?? '',
    instructions: JSON.parse(row.instructions) as string[],
    custom: true,
  }));
  return [...libraryRecords, ...custom];
}

// ---- favourites (settings value: array of exercise ids) ---------------------

export async function getFavourites(database: SQLiteDatabase): Promise<string[]> {
  return (await getSetting<string[]>(database, 'favourites')) ?? [];
}

export async function toggleFavourite(database: SQLiteDatabase, exerciseId: string) {
  const current = await getFavourites(database);
  const next = current.includes(exerciseId)
    ? current.filter((id) => id !== exerciseId)
    : [...current, exerciseId];
  await setSetting(database, 'favourites', next);
  return next;
}

// ---- custom exercises -----------------------------------------------------

export type CustomExerciseInput = {
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  mode: ExerciseMode;
};

/** Creates a custom exercise, or updates it when an id is given. Returns the id. */
export async function saveCustomExercise(
  database: SQLiteDatabase,
  input: CustomExerciseInput,
  id?: string,
): Promise<string> {
  const stamp = now();
  const values = [
    input.name.trim(),
    JSON.stringify(input.primaryMuscles),
    JSON.stringify(input.secondaryMuscles),
    input.equipment,
    input.mode,
  ] as const;
  if (id) {
    await database.runAsync(
      'UPDATE custom_exercises SET name = ?, primary_muscles = ?, secondary_muscles = ?, equipment = ?, mode = ?, updated_at = ? WHERE id = ?',
      ...values,
      stamp,
      id,
    );
    return id;
  }
  const newCustomId = newId('custom');
  await database.runAsync(
    'INSERT INTO custom_exercises (id,user_id,name,primary_muscles,secondary_muscles,equipment,mode,instructions,updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
    newCustomId,
    LOCAL_USER,
    ...values,
    '[]',
    stamp,
  );
  return newCustomId;
}

/** Soft delete. Routines and history keep the exercise's name. */
export async function deleteCustomExercise(database: SQLiteDatabase, id: string) {
  const stamp = now();
  await database.runAsync(
    'UPDATE custom_exercises SET deleted_at = ?, updated_at = ? WHERE id = ?',
    stamp,
    stamp,
    id,
  );
}

// ---- exercise references (links the user attaches to any exercise) ----------

export type ExerciseReference = { id: string; url: string; title: string | null };

export async function listReferences(
  database: SQLiteDatabase,
  exerciseId: string,
): Promise<ExerciseReference[]> {
  const rows = await database.getAllAsync<{ id: string; uri: string; title: string | null }>(
    "SELECT id, uri, title FROM exercise_refs WHERE user_id = ? AND exercise_id = ? AND kind = 'url' AND deleted_at IS NULL ORDER BY updated_at ASC, rowid ASC",
    LOCAL_USER,
    exerciseId,
  );
  return rows.map((row) => ({ id: row.id, url: row.uri, title: row.title }));
}

export async function addReference(
  database: SQLiteDatabase,
  exerciseId: string,
  url: string,
  title: string | null,
) {
  const stamp = now();
  await database.runAsync(
    "INSERT INTO exercise_refs (id,user_id,exercise_id,kind,uri,title,updated_at) VALUES (?,?,?,'url',?,?,?)",
    newId('ref'),
    LOCAL_USER,
    exerciseId,
    url,
    title?.trim() || null,
    stamp,
  );
}

export async function deleteReference(database: SQLiteDatabase, id: string) {
  const stamp = now();
  await database.runAsync(
    'UPDATE exercise_refs SET deleted_at = ?, updated_at = ? WHERE id = ?',
    stamp,
    stamp,
    id,
  );
}
