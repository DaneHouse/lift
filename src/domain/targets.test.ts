import { describe, expect, it } from 'vitest';
import { nextTarget, planForTemplateItem, type ExercisePlan } from './targets';
import type { WorkoutPerformance } from './progression';

const session = (weight: number, reps: number[]): WorkoutPerformance => ({
  date: '2026-10-01',
  sets: reps.map((value) => ({ weight, reps: value, completed: true })),
});

const linear: ExercisePlan = {
  policy: 'linear',
  sets: 3,
  repMin: 5,
  repMax: 5,
  increment: 5,
  seconds: 0,
};
const double: ExercisePlan = {
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
