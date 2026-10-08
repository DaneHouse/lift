import { describe, expect, it } from 'vitest';
import { barOptions, plateOptions, platesForTarget, reverseTarget, totalWeight } from './plates';

describe('plate builder', () => {
  it('totals plates on both sides', () => expect(totalWeight(45, [45, 10, 2.5])).toBe(160));
  it('reverses a target using inventory', () =>
    expect(platesForTarget(225, barOptions.lb.olympic, plateOptions.lb)).toEqual({
      platesPerSide: [45, 45],
      actualWeight: 225,
      remainder: 0,
    }));
  it('reports an unreachable remainder', () =>
    expect(platesForTarget(47, 45, [2.5]).remainder).toBe(2));
});

describe('unit consistency', () => {
  it('keeps bar types in the same unit as the plates', () => {
    expect(barOptions.lb.olympic).toBe(45);
    expect(barOptions.kg.olympic).toBe(20);
    expect(barOptions.kg.ez).toBeLessThan(barOptions.lb.ez / 2);
  });
  it('uses a unit-appropriate reverse target', () => {
    expect(reverseTarget.lb).toBe(225);
    expect(reverseTarget.kg).toBe(100);
    expect(
      platesForTarget(reverseTarget.kg, barOptions.kg.olympic, plateOptions.kg).remainder,
    ).toBe(0);
  });
});
