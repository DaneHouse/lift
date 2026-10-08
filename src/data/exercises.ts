import type { ExerciseMode } from '@/domain/exercises';
import data from './exercises.json';

export type LibraryExercise = {
  id: string;
  name: string;
  category: string;
  mode: ExerciseMode;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
};

export const exerciseLibrary = data as LibraryExercise[];

export function filterExercises(query: string, muscle?: string, equipment?: string) {
  const normalized = query.trim().toLowerCase();
  return exerciseLibrary.filter((exercise) => {
    const muscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles].map((value) =>
      value.toLowerCase(),
    );
    return (
      (!normalized || exercise.name.toLowerCase().includes(normalized)) &&
      (!muscle || muscles.includes(muscle.toLowerCase())) &&
      (!equipment || exercise.equipment === equipment)
    );
  });
}
