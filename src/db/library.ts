import type { SQLiteDatabase } from 'expo-sqlite';
import { exerciseLibrary } from '@/data/exercises';
import { modeFor, type ExerciseMode } from '@/domain/exercises';

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
