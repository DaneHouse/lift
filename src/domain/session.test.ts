import { describe, expect, it } from 'vitest';
import { adjustNumber, estimatedOneRepMax, isPersonalRecord, sessionVolume } from './session';

describe('guided session logic', () => {
  it('clamps stepper values', () => expect(adjustNumber(0, -5)).toBe(0));
  it('estimates one rep max and detects records', () => {
    expect(estimatedOneRepMax(100, 10)).toBeCloseTo(133.33, 1);
    expect(isPersonalRecord(105, 10, [{ weight: 100, reps: 10 }])).toBe(true);
  });
  it('counts only completed set volume', () =>
    expect(
      sessionVolume([
        {
          id: 'x',
          name: 'Squat',
          reason: '',
          restSeconds: 90,
          sets: [
            { id: '1', weight: 100, reps: 5, targetReps: 5, done: true },
            { id: '2', weight: 100, reps: 5, targetReps: 5, done: false },
          ],
        },
      ]),
    ).toBe(500));
});

describe('regressions', () => {
  it('a set with no reps is never a personal record', () => {
    expect(isPersonalRecord(100, 0, [])).toBe(false);
    expect(isPersonalRecord(100, 0, [{ weight: 90, reps: 5 }])).toBe(false);
  });
});
