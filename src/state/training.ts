import { create } from 'zustand';
import type { SessionExercise } from '@/domain/session';

const makeSets = (exerciseId: string, count: number, weight: number, reps: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${exerciseId}-${index}`,
    weight,
    reps,
    targetReps: reps,
    done: false,
  }));
const demoSession: SessionExercise[] = [
  {
    id: 'squat',
    name: 'Back squat',
    reason: 'Hit 3x5 last time → +5 lb',
    restSeconds: 150,
    sets: makeSets('squat', 3, 185, 5),
  },
  {
    id: 'bench',
    name: 'Barbell bench press',
    reason: 'Target not complete → hold',
    restSeconds: 120,
    sets: makeSets('bench', 3, 135, 8),
  },
  {
    id: 'row',
    name: 'Barbell row',
    reason: 'Completed 10 reps → aim for 11',
    restSeconds: 90,
    sets: makeSets('row', 3, 115, 11),
  },
  {
    id: 'lunge',
    name: 'Dumbbell lunge',
    reason: 'Build from 8',
    restSeconds: 75,
    sets: makeSets('lunge', 3, 35, 8),
  },
  {
    id: 'raise',
    name: 'Lateral raise',
    reason: 'Completed 12 reps → aim for 13',
    restSeconds: 60,
    sets: makeSets('raise', 3, 15, 13),
  },
  {
    id: 'curl',
    name: 'Dumbbell curl',
    reason: 'Hit top of range → +5 lb, reset to 8',
    restSeconds: 60,
    sets: makeSets('curl', 3, 25, 8),
  },
  {
    id: 'deadbug',
    name: 'Dead bug',
    reason: 'Core slot',
    restSeconds: 45,
    sets: makeSets('deadbug', 3, 0, 10),
  },
];

type TrainingState = {
  exercises: SessionExercise[];
  startedAt?: string | undefined;
  completedAt?: string | undefined;
  notes: string;
  start: () => void;
  complete: () => void;
  toggleSet: (exerciseId: string, setId: string) => void;
  adjustSet: (
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps' | 'rir',
    delta: number,
  ) => void;
  setNotes: (notes: string) => void;
};

export const useTrainingStore = create<TrainingState>((set) => ({
  exercises: demoSession,
  notes: '',
  start: () => set({ startedAt: new Date().toISOString(), completedAt: undefined }),
  complete: () => set({ completedAt: new Date().toISOString() }),
  toggleSet: (exerciseId, setId) =>
    set((state) => ({
      exercises: state.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((workoutSet) =>
                workoutSet.id === setId ? { ...workoutSet, done: !workoutSet.done } : workoutSet,
              ),
            }
          : exercise,
      ),
    })),
  adjustSet: (exerciseId, setId, field, delta) =>
    set((state) => ({
      exercises: state.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((workoutSet) =>
                workoutSet.id === setId
                  ? { ...workoutSet, [field]: Math.max(0, (workoutSet[field] ?? 0) + delta) }
                  : workoutSet,
              ),
            }
          : exercise,
      ),
    })),
  setNotes: (notes) => set({ notes }),
}));
