import { describe, expect, it } from 'vitest';
import { fitSessionLength, nextRoutine, starterTemplates } from './plans';

describe('plans', () => {
  it('ships all full-volume starter templates', () => {
    expect(starterTemplates.map((item) => item.id)).toEqual([
      'ppl-6',
      'ppl-3',
      'upper-lower-4',
      'full-3',
      '5x5',
    ]);
    expect(
      starterTemplates.every((template) => template.days.every((day) => day.length >= 6)),
    ).toBe(true);
  });
  it('fits volume to session preference without removing core or rehab', () => {
    expect(fitSessionLength(starterTemplates[0]!.days[0]!, 45)).toHaveLength(6);
    expect(fitSessionLength(starterTemplates[0]!.days[0]!, 90).at(-1)?.role).toBe('accessory');
  });
  it('prefers a weekday schedule then advances rotation', () => {
    expect(
      nextRoutine(
        [{ id: 'monday', mode: 'weekday', weekday: 1 }],
        new Date('2026-10-05T12:00:00'),
        [],
      )?.id,
    ).toBe('monday');
    expect(
      nextRoutine(
        [
          { id: 'a', mode: 'rotation', rotationOrder: 0 },
          { id: 'b', mode: 'rotation', rotationOrder: 1 },
        ],
        new Date(),
        ['a'],
      )?.id,
    ).toBe('b');
  });
});
