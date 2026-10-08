import { create } from 'zustand';
import type { SessionDraft } from '@/db/repository';

/**
 * UI mirror of the in-flight session. The SQLite draft (settings key `activeSession`)
 * is the source of truth; the session screen loads it on mount and saves every change.
 */
type TrainingState = {
  draft: SessionDraft | null;
  setDraft: (draft: SessionDraft | null) => void;
  toggleSet: (exerciseId: string, setId: string) => void;
  adjustSet: (
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps' | 'rir',
    delta: number,
  ) => void;
  setNotes: (notes: string) => void;
};

const updateSet = (
  draft: SessionDraft,
  exerciseId: string,
  setId: string,
  change: (set: SessionDraft['exercises'][number]['sets'][number]) => object,
): SessionDraft => ({
  ...draft,
  exercises: draft.exercises.map((exercise) =>
    exercise.id === exerciseId
      ? {
          ...exercise,
          sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...change(set) } : set)),
        }
      : exercise,
  ),
});

export const useTrainingStore = create<TrainingState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  toggleSet: (exerciseId, setId) =>
    set((state) =>
      state.draft
        ? {
            draft: updateSet(state.draft, exerciseId, setId, (current) => ({
              done: !current.done,
            })),
          }
        : state,
    ),
  adjustSet: (exerciseId, setId, field, delta) =>
    set((state) =>
      state.draft
        ? {
            draft: updateSet(state.draft, exerciseId, setId, (current) => ({
              [field]: Math.max(0, (current[field] ?? 0) + delta),
            })),
          }
        : state,
    ),
  setNotes: (notes) => set((state) => (state.draft ? { draft: { ...state.draft, notes } } : state)),
}));
