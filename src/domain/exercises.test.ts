import { describe, expect, it } from 'vitest';
import { modeFor } from './exercises';

describe('modeFor', () => {
  it('logs holds and carries by time', () => {
    expect(modeFor('Side plank')).toBe('time');
    expect(modeFor('Farmer carry')).toBe('time');
  });
  it('logs ordinary lifts by reps', () => expect(modeFor('Back squat')).toBe('reps'));
  it('treats the cardio category as cardio', () =>
    expect(modeFor('Rowing machine', 'cardio')).toBe('cardio'));
});
