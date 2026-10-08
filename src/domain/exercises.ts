/** How an exercise is logged: by reps, by holding time, or as cardio (time based). */
export type ExerciseMode = 'reps' | 'time' | 'cardio';

const timedName = /\b(plank|wall sit|hold|hang|carry|isometric)\b/i;

/** Library category is a body part; only cardio is a category signal. Names catch timed holds. */
export function modeFor(name: string, category?: string): ExerciseMode {
  if (category === 'cardio') return 'cardio';
  return timedName.test(name) ? 'time' : 'reps';
}
