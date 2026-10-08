import { create } from 'zustand';
import type { SessionDraft } from '@/db/repository';

/**
 * UI mirror of the in-flight session. The SQLite draft (settings key `activeSession`)
 * is the source of truth; the session screen loads it on mount and saves every change.
 */
type SetField = 'weight' | 'reps' | 'rir' | 'seconds';

type TrainingState = {
  draft: SessionDraft | null;
  setDraft: (draft: SessionDraft | null) => void;
  toggleSet: (slotId: string, setId: string) => void;
  adjustSet: (slotId: string, setId: string, field: SetField, delta: number) => void;
  setNotes: (notes: string) => void;
};

type Draft = SessionDraft;
type Slot = Draft['exercises'][number];
type SetRow = Slot['sets'][number];

const updateSet = (
  draft: Draft,
  slotId: string,
  setId: string,
  change: (set: SetRow) => Partial<SetRow>,
): Draft => ({
  ...draft,
  exercises: draft.exercises.map((exercise) =>
    exercise.slotId === slotId
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
  toggleSet: (slotId, setId) =>
    set((state) =>
      state.draft
        ? {
            draft: updateSet(state.draft, slotId, setId, (current) => ({
              done: !current.done,
            })),
          }
        : state,
    ),
  adjustSet: (slotId, setId, field, delta) =>
    set((state) =>
      state.draft
        ? {
            draft: updateSet(state.draft, slotId, setId, (current) => ({
              [field]: Math.max(0, (current[field] ?? 0) + delta),
            })),
          }
        : state,
    ),
  setNotes: (notes) => set((state) => (state.draft ? { draft: { ...state.draft, notes } } : state)),
}));
