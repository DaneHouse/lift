import type { Unit } from './progression';

export const plateOptions: Record<Unit, number[]> = {
  lb: [45, 35, 25, 10, 5, 2.5],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
};
/** Bar weights per unit. The kg column is an approximate default; users can set their own bar later. */
export const barOptions = {
  lb: { olympic: 45, ez: 25, trap: 45, smith: 15 },
  kg: { olympic: 20, ez: 11, trap: 20, smith: 7 },
} as const;

/** Load used by the reverse plate view. Each unit gets a sensible default. */
export const reverseTarget: Record<Unit, number> = { lb: 225, kg: 100 };

export function totalWeight(barWeight: number, platesPerSide: number[]) {
  return barWeight + platesPerSide.reduce((sum, plate) => sum + plate * 2, 0);
}

export function platesForTarget(target: number, barWeight: number, inventory: number[]) {
  let remaining = Math.max(0, (target - barWeight) / 2);
  const plates: number[] = [];
  for (const plate of [...inventory].sort((a, b) => b - a))
    while (remaining + 1e-9 >= plate) {
      plates.push(plate);
      remaining -= plate;
    }
  return {
    platesPerSide: plates,
    actualWeight: totalWeight(barWeight, plates),
    remainder: remaining * 2,
  };
}
