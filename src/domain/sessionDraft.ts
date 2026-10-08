import type { SessionExercise } from './session';

/** A slot can be swapped or skipped only before any of its sets are logged, so no logged work is lost. */
export const canChangeSlot = (slot: SessionExercise) => !slot.sets.some((set) => set.done);

export function replaceSlot(
  slots: SessionExercise[],
  slotId: string,
  next: SessionExercise,
): SessionExercise[] {
  const current = slots.find((slot) => slot.slotId === slotId);
  if (!current || !canChangeSlot(current)) return slots;
  return slots.map((slot) => (slot.slotId === slotId ? next : slot));
}

export function appendSlot(slots: SessionExercise[], next: SessionExercise): SessionExercise[] {
  return [...slots, next];
}

/** Moves a slot one place up (-1) or down (+1). Ends stay put. */
export function moveSlot(
  slots: SessionExercise[],
  slotId: string,
  direction: -1 | 1,
): SessionExercise[] {
  const from = slots.findIndex((slot) => slot.slotId === slotId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= slots.length) return slots;
  const next = [...slots];
  const [moved] = next.splice(from, 1);
  if (moved) next.splice(to, 0, moved);
  return next;
}

export function setSkipped(
  slots: SessionExercise[],
  slotId: string,
  skipped: boolean,
): SessionExercise[] {
  return slots.map((slot) =>
    slot.slotId === slotId && canChangeSlot(slot) ? { ...slot, skipped } : slot,
  );
}
