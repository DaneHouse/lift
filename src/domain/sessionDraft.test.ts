import { describe, expect, it } from 'vitest';
import { appendSlot, canChangeSlot, moveSlot, replaceSlot, setSkipped } from './sessionDraft';
import type { SessionExercise } from './session';
import { planExtras } from './targets';

const slot = (slotId: string, done = false): SessionExercise => ({
  slotId,
  id: `ex-${slotId}`,
  name: slotId,
  reason: '',
  restSeconds: 90,
  kind: 'reps',
  plan: {
    ...planExtras,
    policy: 'double',
    sets: 1,
    repMin: 8,
    repMax: 12,
    increment: 5,
    seconds: 0,
  },
  sets: [{ id: `${slotId}-1`, weight: 0, reps: 8, targetReps: 8, done }],
});

const order = (slots: SessionExercise[]) => slots.map((item) => item.slotId);

describe('session draft edits', () => {
  it('reorders one place at a time and stops at the ends', () => {
    const slots = [slot('a'), slot('b'), slot('c')];
    expect(order(moveSlot(slots, 'c', -1))).toEqual(['a', 'c', 'b']);
    expect(order(moveSlot(slots, 'a', -1))).toEqual(['a', 'b', 'c']);
    expect(order(moveSlot(slots, 'c', 1))).toEqual(['a', 'b', 'c']);
  });

  it('swaps in place, keeping the slot position', () => {
    const slots = [slot('a'), slot('b'), slot('c')];
    const next = { ...slot('b'), id: 'new-exercise', name: 'New' };
    expect(replaceSlot(slots, 'b', next).map((item) => [item.slotId, item.id])).toEqual([
      ['a', 'ex-a'],
      ['b', 'new-exercise'],
      ['c', 'ex-c'],
    ]);
  });

  it('will not swap or skip a slot that already has logged sets', () => {
    const logged = [slot('a', true)];
    expect(canChangeSlot(logged[0]!)).toBe(false);
    expect(replaceSlot(logged, 'a', slot('z'))).toBe(logged);
    expect(setSkipped(logged, 'a', true)[0]?.skipped).toBeUndefined();
  });

  it('skips and unskips an untouched slot, and adds to the end', () => {
    const skipped = setSkipped([slot('a'), slot('b')], 'b', true);
    expect(skipped[1]?.skipped).toBe(true);
    expect(setSkipped(skipped, 'b', false)[1]?.skipped).toBe(false);
    expect(order(appendSlot(skipped, slot('c')))).toEqual(['a', 'b', 'c']);
  });
});
