import { describe, expect, it } from 'vitest';
import { getTableName } from 'drizzle-orm';
import { schema } from './schema';

describe('local schema', () => {
  it('contains every table in the product model plus progress photos', () => {
    expect(Object.values(schema).map(getTableName)).toEqual(
      expect.arrayContaining([
        'profiles',
        'exercises',
        'custom_exercises',
        'exercise_refs',
        'routines',
        'routine_items',
        'schedules',
        'workouts',
        'workout_sets',
        'bodyweight',
        'injuries',
        'injury_checkins',
        'health_daily',
        'coach_threads',
        'coach_proposals',
        'settings',
        'progress_photos',
      ]),
    );
  });
});
