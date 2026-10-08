import type { ExerciseMode } from './exercises';

export type TemplateExercise = {
  name: string;
  sets: number;
  repMin: number;
  repMax: number;
  role: 'compound' | 'accessory' | 'core-rehab';
  /** Timed holds store seconds in repMin/repMax. */
  mode: ExerciseMode;
};
export type StarterTemplate = { id: string; name: string; days: TemplateExercise[][] };

const ex = (
  name: string,
  sets: number,
  repMin: number,
  repMax = repMin,
  role: TemplateExercise['role'] = 'accessory',
): TemplateExercise => ({ name, sets, repMin, repMax, role, mode: 'reps' });
/** A timed hold; the range is in seconds. */
const hold = (name: string, sets: number, secondsMin: number, secondsMax = secondsMin) => ({
  ...ex(name, sets, secondsMin, secondsMax, 'core-rehab'),
  mode: 'time' as const,
});
const push = [
  ex('Barbell bench press', 4, 5, 8, 'compound'),
  ex('Overhead press', 3, 6, 10, 'compound'),
  ex('Incline dumbbell press', 3, 8, 12),
  ex('Cable fly', 3, 10, 15),
  ex('Lateral raise', 4, 12, 20),
  ex('Triceps extension', 3, 10, 15),
  ex('Dead bug', 3, 10, 12, 'core-rehab'),
];
const pull = [
  ex('Deadlift', 3, 3, 5, 'compound'),
  ex('Pull-up', 4, 6, 10, 'compound'),
  ex('Barbell row', 4, 6, 10, 'compound'),
  ex('Lat pulldown', 3, 8, 12),
  ex('Rear delt fly', 3, 12, 20),
  ex('Biceps curl', 3, 8, 12),
  ex('Pallof press', 3, 10, 12, 'core-rehab'),
];
const legs = [
  ex('Back squat', 4, 5, 8, 'compound'),
  ex('Romanian deadlift', 3, 6, 10, 'compound'),
  ex('Leg press', 3, 8, 12),
  ex('Leg curl', 3, 10, 15),
  ex('Leg extension', 3, 10, 15),
  ex('Calf raise', 4, 10, 15),
  hold('Side plank', 3, 30, 45),
];
const upper = [...push.slice(0, 3), ...pull.slice(1, 4), hold('Farmer carry', 3, 30, 45)];
const lower = legs;
const full = [
  legs[0]!,
  push[0]!,
  pull[2]!,
  ex('Romanian deadlift', 3, 8, 10, 'compound'),
  ex('Lateral raise', 3, 12, 15),
  ex('Biceps curl', 3, 10, 12),
  ex('Bird dog', 3, 10, 12, 'core-rehab'),
];
const five = [
  ex('Back squat', 5, 5, 5, 'compound'),
  ex('Barbell bench press', 5, 5, 5, 'compound'),
  ex('Barbell row', 5, 5, 5, 'compound'),
  ex('Pull-up', 3, 6, 10),
  ex('Lunge', 3, 8, 12),
  ex('Face pull', 3, 12, 15),
  hold('Plank', 3, 30, 45),
];

export const starterTemplates: StarterTemplate[] = [
  { id: 'ppl-6', name: 'Push / Pull / Legs — 6 day', days: [push, pull, legs, push, pull, legs] },
  { id: 'ppl-3', name: 'Push / Pull / Legs — 3 day', days: [push, pull, legs] },
  { id: 'upper-lower-4', name: 'Upper / Lower — 4 day', days: [upper, lower, upper, lower] },
  { id: 'full-3', name: 'Full Body — 3 day', days: [full, full, full] },
  { id: '5x5', name: '5x5', days: [five, five, five] },
];

export function fitSessionLength(exercises: TemplateExercise[], minutes: 45 | 60 | 75 | 90) {
  const target = minutes <= 45 ? 6 : minutes <= 60 ? 7 : minutes <= 75 ? 8 : 9;
  const core = exercises.filter((exercise) => exercise.role === 'core-rehab');
  const training = exercises.filter((exercise) => exercise.role !== 'core-rehab');
  const result = [...training.slice(0, Math.max(5, target - core.length)), ...core];
  while (result.length < target) result.push(ex(`Accessory ${result.length + 1}`, 3, 10, 15));
  return result;
}

export type ScheduledRoutine = {
  id: string;
  mode: 'weekday' | 'rotation';
  weekday?: number;
  rotationOrder?: number;
};
export function nextRoutine(
  schedule: ScheduledRoutine[],
  date: Date,
  completedRoutineIds: string[],
) {
  const weekday = schedule.find(
    (entry) => entry.mode === 'weekday' && entry.weekday === date.getDay(),
  );
  if (weekday) return weekday;
  const rotation = schedule
    .filter((entry) => entry.mode === 'rotation')
    .sort((a, b) => (a.rotationOrder ?? 0) - (b.rotationOrder ?? 0));
  if (!rotation.length) return undefined;
  const lastCompleted = completedRoutineIds.at(-1);
  const index = rotation.findIndex((entry) => entry.id === lastCompleted);
  return rotation[(index + 1) % rotation.length];
}
