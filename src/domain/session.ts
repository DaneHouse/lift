import type { ExercisePlan } from './targets';

export type SessionSet = {
  id: string;
  weight: number;
  reps: number;
  /** Hold length for time-based sets. */
  seconds?: number | undefined;
  targetReps: number;
  rir?: number | undefined;
  done: boolean;
  warmup?: boolean | undefined;
  setType?: 'normal' | 'warmup' | 'drop' | undefined;
};
export type SessionExercise = {
  /** Unique per session slot, so the same exercise can appear twice after an add. */
  slotId: string;
  /** Exercise id (library or custom). */
  id: string;
  name: string;
  reason: string;
  restSeconds: number;
  kind: 'reps' | 'time';
  plan: ExercisePlan;
  skipped?: boolean | undefined;
  /** Set on rehab block slots, so finishing the session can log rehab per injury. */
  rehab?: { injuryId: string; area: string } | undefined;
  /** Name of the exercise this slot replaced after an injury check-in swap. */
  swappedFrom?: string | undefined;
  sets: SessionSet[];
};

export function adjustNumber(value: number, delta: number, minimum = 0) {
  return Math.max(minimum, Math.round((value + delta) * 100) / 100);
}
export function isPersonalRecord(
  weight: number,
  reps: number,
  prior: { weight: number; reps: number }[],
) {
  if (reps <= 0) return false;
  const score = estimatedOneRepMax(weight, reps);
  return (
    prior.length === 0 || prior.every((set) => estimatedOneRepMax(set.weight, set.reps) < score)
  );
}
export function estimatedOneRepMax(weight: number, reps: number) {
  return reps <= 1 ? weight : weight * (1 + reps / 30);
}
export function sessionVolume(exercises: SessionExercise[]) {
  return exercises
    .flatMap((exercise) => exercise.sets)
    .filter((set) => set.done)
    .reduce((sum, set) => sum + set.weight * set.reps, 0);
}
