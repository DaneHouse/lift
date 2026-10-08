/** How an exercise is logged: by reps, by holding time, or as cardio (time based). */
export type ExerciseMode = 'reps' | 'time' | 'cardio';

export const exerciseModes: readonly ExerciseMode[] = ['reps', 'time', 'cardio'];
