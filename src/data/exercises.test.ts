import { describe, expect, it } from 'vitest';
import raw from './exercises.json';
import { exerciseLibrary, filterExercises } from './exercises';

describe('bundled exercise library', () => {
  it('contains the full metadata library with no media fields', () => {
    expect(exerciseLibrary.length).toBeGreaterThanOrEqual(1_000);
    for (const record of raw) {
      expect(record).not.toHaveProperty('image');
      expect(record).not.toHaveProperty('gif_url');
      expect(record).not.toHaveProperty('media_id');
      expect(record.instructions.length).toBeGreaterThan(0);
    }
  });

  it('filters by text, muscle, and equipment', () => {
    const first = exerciseLibrary[0];
    expect(first).toBeDefined();
    if (!first) return;
    expect(filterExercises(first.name, first.primaryMuscles[0], first.equipment)).toContainEqual(
      first,
    );
  });
});
