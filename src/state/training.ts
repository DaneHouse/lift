import { create } from 'zustand';
import type { SessionDraft } from '@/db/repository';
import { type SessionExercise } from '@/domain/session';
import { appendSlot, moveSlot, replaceSlot, setSkipped } from '@/domain/sessionDraft';

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
  setRestEndsAt: (endsAt: string | undefined) => void;
  replaceSlot: (slotId: string, next: SessionExercise) => void;
  appendSlot: (next: SessionExercise) => void;
  moveSlot: (slotId: string, direction: -1 | 1) => void;
  setSkipped: (slotId: string, skipped: boolean) => void;
};

/** Applies a slot edit to the draft, or does nothing when there is no draft. */
const editSlots = (
  state: { draft: SessionDraft | null },
  edit: (slots: SessionExercise[]) => SessionExercise[],
) => (state.draft ? { draft: { ...state.draft, exercises: edit(state.draft.exercises) } } : state);

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
  setRestEndsAt: (restEndsAt) =>
    set((state) => (state.draft ? { draft: { ...state.draft, restEndsAt } } : state)),
  replaceSlot: (slotId, next) =>
    set((state) => editSlots(state, (slots) => replaceSlot(slots, slotId, next))),
  appendSlot: (next) => set((state) => editSlots(state, (slots) => appendSlot(slots, next))),
  moveSlot: (slotId, direction) =>
    set((state) => editSlots(state, (slots) => moveSlot(slots, slotId, direction))),
  setSkipped: (slotId, skipped) =>
    set((state) => editSlots(state, (slots) => setSkipped(slots, slotId, skipped))),
}));
