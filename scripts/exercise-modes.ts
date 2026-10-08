/**
 * Library ids logged by time instead of reps (planks, carries, static holds). Everything else in
 * the dataset is logged by reps, except the cardio category. Curated by hand, not guessed from names.
 */
export const timedExerciseIds = new Set([
  '3544', // bodyweight incline side plank
  '3665', // power point plank
  '2135', // weighted front plank
  '0705', // side bridge v. 2
  '1297', // isometric chest squeeze
  '3419', // l-sit on floor
  '2133', // farmers walk
  '3548', // dumbbell single arm overhead carry
  '0020', // balance board
]);

export function libraryMode(id: string, category: string) {
  if (category === 'cardio') return 'cardio' as const;
  return timedExerciseIds.has(id) ? ('time' as const) : ('reps' as const);
}
