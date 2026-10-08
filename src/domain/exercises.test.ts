import { describe, expect, it } from 'vitest';
import { exerciseLibrary } from '@/data/exercises';
import { exerciseModes } from './exercises';
import { starterTemplates } from './plans';

const byName = (name: string) => exerciseLibrary.find((exercise) => exercise.name === name);

describe('exercise modes', () => {
  it('every library exercise has an explicit mode', () => {
    for (const exercise of exerciseLibrary) expect(exerciseModes).toContain(exercise.mode);
  });
  it('cardio category is cardio', () => {
    const cardio = exerciseLibrary.filter((exercise) => exercise.category === 'cardio');
    expect(cardio.length).toBeGreaterThan(0);
    expect(cardio.every((exercise) => exercise.mode === 'cardio')).toBe(true);
  });
  it('holds and carries are timed', () => {
    expect(byName('weighted front plank')?.mode).toBe('time');
    expect(byName('farmers walk')?.mode).toBe('time');
  });
  it('moving exercises that only mention a hold word stay on reps', () => {
    expect(byName('front plank with twist')?.mode).toBe('reps');
    expect(byName('kettlebell hang clean')?.mode).toBe('reps');
    expect(byName('barbell full squat')?.mode ?? 'reps').toBe('reps');
  });
  it('starter template holds are timed, lifts are not', () => {
    const items = starterTemplates.flatMap((template) => template.days.flat());
    const timed = items.filter((item) => item.mode === 'time').map((item) => item.name);
    expect(new Set(timed)).toEqual(new Set(['Side plank', 'Farmer carry', 'Plank']));
    expect(
      items.filter((item) => item.role === 'compound').every((item) => item.mode === 'reps'),
    ).toBe(true);
  });
});
