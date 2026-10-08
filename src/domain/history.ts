import { estimatedOneRepMax } from './session';

export type HistorySet = {
  exerciseId: string;
  exerciseName: string;
  muscle: string;
  weight: number;
  reps: number;
  done: boolean;
};
export type HistoryWorkout = { id: string; date: string; sets: HistorySet[] };

const pad = (value: number) => String(value).padStart(2, '0');

/** Local calendar day as YYYY-MM-DD. */
export function localDayKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Calendar dates pass through unchanged; instants are bucketed by the device's local day. */
function dayKeyOf(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : localDayKey(new Date(value));
}

export function calendarHeatmap(
  workouts: HistoryWorkout[],
  endDate: string = localDayKey(new Date()),
  days = 84,
) {
  const end = new Date(`${endDate}T12:00:00Z`);
  const counts = new Map<string, number>();
  for (const workout of workouts) {
    const key = dayKeyOf(workout.date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: counts.get(key) ?? 0 };
  });
}

export function exerciseHistory(workouts: HistoryWorkout[], exerciseId: string) {
  return workouts
    .flatMap((workout) =>
      workout.sets
        .filter((set) => set.exerciseId === exerciseId && set.done)
        .map((set) => ({
          ...set,
          date: workout.date,
          e1rm: estimatedOneRepMax(set.weight, set.reps),
        })),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function muscleVolume(workouts: HistoryWorkout[]) {
  const result: Record<string, number> = {};
  for (const set of workouts.flatMap((workout) => workout.sets))
    if (set.done) result[set.muscle] = (result[set.muscle] ?? 0) + set.weight * set.reps;
  return result;
}

export function personalRecord(history: ReturnType<typeof exerciseHistory>) {
  return history.reduce<(typeof history)[number] | undefined>(
    (best, entry) => (!best || entry.e1rm > best.e1rm ? entry : best),
    undefined,
  );
}
