import { describe, expect, it } from 'vitest';
import { barOptions, plateOptions, platesForTarget, totalWeight } from './plates';

describe('plate builder', () => {
  it('totals plates on both sides', () => expect(totalWeight(45, [45, 10, 2.5])).toBe(160));
  it('reverses a target using inventory', () =>
    expect(platesForTarget(225, barOptions.olympicLb, plateOptions.lb)).toEqual({
      platesPerSide: [45, 45],
      actualWeight: 225,
      remainder: 0,
    }));
  it('reports an unreachable remainder', () =>
    expect(platesForTarget(47, 45, [2.5]).remainder).toBe(2));
});
