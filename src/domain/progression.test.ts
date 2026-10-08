import { describe, expect, it } from 'vitest';
import {
  bodyweightProgression,
  defaultPolicy,
  doubleProgression,
  linearProgression,
  rirProgression,
  timeProgression,
  topSetBackoffs,
  wave531,
  type WorkoutPerformance,
} from './progression';

const session = (reps: number, completed = true, rir?: number): WorkoutPerformance => ({
  date: '2026-10-01',
  sets: Array.from({ length: 3 }, () => ({ weight: 100, reps, completed, rir })),
});

describe('progression policies', () => {
  it('adds weight after a completed linear target', () =>
    expect(
      linearProgression({ weight: 100, reps: 5, sets: 3, increment: 5, history: [session(5)] }),
    ).toMatchObject({ weight: 105, reason: 'Hit 3x5 last time → +5' }));
  it('deloads after three consecutive misses', () =>
    expect(
      linearProgression({
        weight: 100,
        reps: 5,
        sets: 3,
        increment: 5,
        history: [session(4), session(4), session(4)],
      }).weight,
    ).toBe(90));
  it('climbs a double range then resets after adding weight', () => {
    expect(
      doubleProgression({
        weight: 50,
        reps: 8,
        sets: 3,
        increment: 5,
        repMin: 8,
        repMax: 12,
        history: [session(10)],
      }).reps,
    ).toBe(11);
    expect(
      doubleProgression({
        weight: 50,
        reps: 12,
        sets: 3,
        increment: 5,
        repMin: 8,
        repMax: 12,
        history: [session(12)],
      }),
    ).toMatchObject({ weight: 55, reps: 8 });
  });
  it('adjusts from RIR without hidden state', () =>
    expect(
      rirProgression({
        weight: 100,
        reps: 8,
        sets: 3,
        increment: 5,
        targetRir: 2,
        history: [session(8, true, 4)],
      }).weight,
    ).toBe(105));
  it('calculates top set back-offs', () =>
    expect(
      topSetBackoffs({
        weight: 100,
        reps: 5,
        sets: 4,
        increment: 5,
        history: [session(5)],
        backoffPercent: 0.15,
      }),
    ).toMatchObject({ weight: 105, backoffWeight: 90 }));
  it('runs all four 5/3/1-style wave weeks', () =>
    expect(
      [1, 2, 3, 4].map(
        (week) =>
          wave531({
            weight: 0,
            reps: 0,
            sets: 3,
            increment: 5,
            trainingMax: 200,
            week: week as 1 | 2 | 3 | 4,
          }).reps,
      ),
    ).toEqual([5, 3, 1, 5]));
  it('progresses timed holds', () =>
    expect(
      timeProgression({
        weight: 0,
        reps: 0,
        sets: 3,
        increment: 1,
        seconds: 30,
        secondsIncrement: 5,
        history: [
          {
            date: 'x',
            sets: Array.from({ length: 3 }, () => ({ weight: 0, seconds: 30, completed: true })),
          },
        ],
      }).seconds,
    ).toBe(35));
  it('progresses bodyweight reps before sets', () =>
    expect(
      bodyweightProgression({
        reps: 10,
        repsMax: 12,
        sets: 3,
        setsMax: 4,
        increment: 1,
        history: [session(10)],
      }),
    ).toMatchObject({ reps: 11, sets: 3 }));
  it('provides category defaults', () =>
    expect(defaultPolicy('rehab')).toEqual({ policy: 'double', repMin: 12, repMax: 20 }));
});
