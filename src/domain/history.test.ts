import { describe, expect, it } from 'vitest';
import {
  calendarHeatmap,
  exerciseHistory,
  muscleVolume,
  personalRecord,
  type HistoryWorkout,
} from './history';

const workouts: HistoryWorkout[] = [
  {
    id: '1',
    date: '2026-10-01',
    sets: [
      {
        exerciseId: 'squat',
        exerciseName: 'Squat',
        muscle: 'upper legs',
        weight: 100,
        reps: 5,
        done: true,
      },
    ],
  },
  {
    id: '2',
    date: '2026-10-03',
    sets: [
      {
        exerciseId: 'squat',
        exerciseName: 'Squat',
        muscle: 'upper legs',
        weight: 105,
        reps: 5,
        done: true,
      },
    ],
  },
];

describe('history statistics', () => {
  it('builds a fixed daily heatmap', () =>
    expect(calendarHeatmap(workouts, '2026-10-03', 3).map((day) => day.count)).toEqual([1, 0, 1]));
  it('builds per-exercise e1RM history and finds the PR', () => {
    const history = exerciseHistory(workouts, 'squat');
    expect(history).toHaveLength(2);
    expect(personalRecord(history)?.weight).toBe(105);
  });
  it('aggregates completed volume by muscle', () =>
    expect(muscleVolume(workouts)).toEqual({ 'upper legs': 1025 }));
});

describe('regressions', () => {
  it('buckets an evening workout under the local calendar day', () => {
    const evening = new Date(2026, 9, 1, 21, 30);
    const heatmap = calendarHeatmap(
      [{ id: 'x', date: evening.toISOString(), sets: [] }],
      '2026-10-01',
      3,
    );
    expect(heatmap.find((day) => day.count > 0)?.date).toBe('2026-10-01');
  });
});
