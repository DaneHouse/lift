import { describe, expect, it } from 'vitest';
import { nextTarget, planExtras, planForTemplateItem, type ExercisePlan } from './targets';
import type { WorkoutPerformance } from './progression';

const session = (weight: number, reps: number[]): WorkoutPerformance => ({
  date: '2026-10-01',
  sets: reps.map((value) => ({ weight, reps: value, completed: true })),
});

const linear: ExercisePlan = {
  ...planExtras,
  policy: 'linear',
  sets: 3,
  repMin: 5,
  repMax: 5,
  increment: 5,
  seconds: 0,
};
const double: ExercisePlan = {
  ...planExtras,
  policy: 'double',
  sets: 3,
  repMin: 8,
  repMax: 12,
  increment: 5,
  seconds: 0,
};

describe('nextTarget with a three session history', () => {
  it('linear: each hit adds the increment, reason names the last session', () => {
    const history = [session(100, [5, 5, 5]), session(105, [5, 5, 5]), session(110, [5, 5, 5])];
    expect(nextTarget(linear, history.slice(0, 1), 'lb')).toMatchObject({
      weight: 105,
      reason: 'Hit 3x5 last time → +5 lb',
    });
    expect(nextTarget(linear, history.slice(0, 2), 'lb').weight).toBe(110);
    expect(nextTarget(linear, history, 'lb')).toMatchObject({ weight: 115, reps: 5, sets: 3 });
  });

  it('double: climbs reps inside the range, then adds weight at the top', () => {
    const climbing = [session(100, [8, 8, 8]), session(100, [9, 9, 9]), session(100, [10, 10, 10])];
    expect(nextTarget(double, climbing, 'lb')).toMatchObject({ weight: 100, reps: 11 });
    const top = [session(100, [12, 12, 12])];
    expect(nextTarget(double, top, 'lb')).toMatchObject({
      weight: 105,
      reps: 8,
      reason: 'Hit top of range 12 → +5 lb, reset to 8',
    });
  });

  it('deloads 10% after three consecutive misses, once per block', () => {
    const misses = [session(100, [3, 3, 3]), session(100, [3, 3, 3]), session(100, [3, 3, 3])];
    expect(nextTarget(linear, misses, 'lb')).toMatchObject({
      weight: 90,
      reason: 'Missed target 3 sessions → -10%',
    });
    const afterDeload = [...misses, session(90, [3, 3, 3])];
    expect(nextTarget(linear, afterDeload, 'lb')).toMatchObject({
      weight: 90,
      reason: 'Target not complete → hold',
    });
  });

  it('with no history the target is the plan with a plain reason', () => {
    expect(nextTarget(double, [], 'lb')).toMatchObject({
      weight: 0,
      reps: 8,
      reason: 'Plan 3×8–12 · no history yet',
    });
  });
});

describe('plan defaults', () => {
  it('compounds are linear, accessories double, holds by time', () => {
    const compound = planForTemplateItem(
      { sets: 4, repMin: 5, repMax: 8, role: 'compound' },
      'reps',
      'lb',
    );
    expect(compound).toMatchObject({ policy: 'linear', repMin: 5, increment: 5 });
    expect(
      planForTemplateItem({ sets: 3, repMin: 8, repMax: 12, role: 'accessory' }, 'reps', 'kg'),
    ).toMatchObject({ policy: 'double', repMin: 8, repMax: 12, increment: 2.5 });
    expect(
      planForTemplateItem({ sets: 3, repMin: 30, repMax: 45, role: 'core-rehab' }, 'time', 'lb'),
    ).toMatchObject({ policy: 'time', seconds: 30 });
  });
});

describe('nextTarget with the other policies', () => {
  const rir: ExercisePlan = { ...double, policy: 'rir', repMin: 6, repMax: 6, targetRir: 2 };
  const withRir = (weight: number, value: number): WorkoutPerformance => ({
    date: '2026-10-01',
    sets: [1, 2, 3].map(() => ({ weight, reps: 6, rir: value, completed: true })),
  });

  it('rir: easy sets add weight, grindy sets drop it, on target holds', () => {
    expect(nextTarget(rir, [withRir(100, 4)], 'lb')).toMatchObject({ weight: 105 });
    expect(nextTarget(rir, [withRir(100, 0)], 'lb')).toMatchObject({ weight: 95 });
    expect(nextTarget(rir, [withRir(100, 2)], 'lb')).toMatchObject({ weight: 100 });
  });

  it('top set + back-offs: back-off weight comes from the new top set', () => {
    const plan: ExercisePlan = {
      ...linear,
      policy: 'top-backoff',
      repMin: 5,
      repMax: 5,
      backoffPercent: 0.15,
    };
    const result = nextTarget(plan, [session(200, [5, 5, 5])], 'lb');
    expect(result.weight).toBe(205);
    expect(result.backoffWeight).toBe(175);
    expect(result.reason).toContain('back-offs -15%');
  });

  it('5/3/1: week and training max follow the number of logged sessions', () => {
    const plan: ExercisePlan = { ...linear, policy: '531', sets: 3, trainingMax: 200 };
    const log = (count: number) => Array.from({ length: count }, () => session(150, [5, 5, 5]));
    expect(nextTarget(plan, [], 'lb')).toMatchObject({ weight: 150, reps: 5 });
    expect(nextTarget(plan, log(1), 'lb')).toMatchObject({ weight: 170, reps: 3 });
    expect(nextTarget(plan, log(2), 'lb')).toMatchObject({ weight: 190, reps: 1 });
    expect(nextTarget(plan, log(3), 'lb')).toMatchObject({ weight: 120, reps: 5 });
    // New cycle: training max rises by one increment.
    expect(nextTarget(plan, log(4), 'lb')).toMatchObject({ weight: 155, reps: 5 });
  });

  it('bodyweight: +1 rep until the ceiling, then +1 set', () => {
    const plan: ExercisePlan = {
      ...double,
      policy: 'bodyweight',
      repMin: 8,
      repMax: 10,
    };
    expect(nextTarget(plan, [session(0, [8, 8, 8])], 'lb')).toMatchObject({ reps: 9, sets: 3 });
    const ladder = [session(0, [8, 8, 8]), session(0, [9, 9, 9]), session(0, [10, 10, 10])];
    expect(nextTarget(plan, ladder, 'lb')).toMatchObject({
      reps: 10,
      sets: 4,
    });
  });
});

describe('deload weeks', () => {
  const dated = (date: string, weight: number, reps: number[]): WorkoutPerformance => ({
    date,
    sets: reps.map((value) => ({ weight, reps: value, completed: true })),
  });
  const plan: ExercisePlan = { ...linear, deloadEvery: 4 };
  const history = [
    dated('2026-09-01T10:00:00Z', 100, [5, 5, 5]),
    dated('2026-09-08T10:00:00Z', 105, [5, 5, 5]),
    dated('2026-09-15T10:00:00Z', 110, [5, 5, 5]),
  ];

  it('lowers the target in every Nth week only', () => {
    expect(nextTarget(plan, history, 'lb', new Date('2026-09-20T10:00:00Z')).weight).toBe(115);
    expect(nextTarget(plan, history, 'lb', new Date('2026-09-23T10:00:00Z'))).toMatchObject({
      weight: 105,
      reason: 'Deload week → -10%',
    });
  });

  it('a session logged in a deload week does not move the target', () => {
    const after = [...history, dated('2026-09-23T10:00:00Z', 105, [5, 5, 5])];
    expect(nextTarget(plan, after, 'lb', new Date('2026-09-30T10:00:00Z')).weight).toBe(115);
  });

  it('off by default', () => {
    expect(nextTarget(linear, history, 'lb', new Date('2026-09-23T10:00:00Z')).weight).toBe(115);
  });
});
