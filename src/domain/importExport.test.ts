import { describe, expect, it } from 'vitest';
import { detectFormat, exportAllData, importWorkoutCsv } from './importExport';

const STRONG = [
  'Date,Workout Name,Exercise Name,Set Order,Weight,Reps,RPE',
  '2026-01-01 10:00:00,"Push, heavy",Bench Press,1,100,5,8',
  '2026-01-01 10:00:00,"Push, heavy",Bench Press,2,100,5,',
].join('\n');
const HEVY = [
  'title,start_time,exercise_title,set_index,set_type,weight_kg,reps',
  'Pull,2026-01-02 09:00:00,Row,0,dropset,80,10',
  'Pull,2026-01-02 09:00:00,Row,1,warmup,20,12',
].join('\n');
const FITNOTES = [
  'Date,Exercise,Category,Weight (kgs),Reps',
  '2026-01-03,Squat,Legs,100,5',
  '2026-01-03,Leg Press,Legs,200,10',
].join('\n');

describe('format detection', () => {
  it('detects each supported format, including single-line headers', () => {
    expect(detectFormat(STRONG)).toBe('strong');
    expect(detectFormat(HEVY)).toBe('hevy');
    expect(detectFormat(FITNOTES)).toBe('fitnotes');
    expect(detectFormat('Date,Foo\n1,2')).toBeNull();
    expect(detectFormat('exercise name,weight,reps')).toBe('strong');
  });
  it('rejects an unrecognised file instead of guessing', () => {
    expect(() => importWorkoutCsv('a,b\n1,2')).toThrow(/Unrecognised CSV/);
  });
});

describe('Strong import', () => {
  it('keeps quoted commas, maps RPE to RIR, and leaves blank RPE empty', () => {
    const { format, sets, skipped } = importWorkoutCsv(STRONG);
    expect(format).toBe('strong');
    expect(skipped).toBe(0);
    expect(sets).toHaveLength(2);
    expect(sets[0]).toMatchObject({
      workoutName: 'Push, heavy',
      exerciseName: 'Bench Press',
      weight: 100,
      reps: 5,
      rir: 2,
    });
    expect(sets[1]?.rir).toBeUndefined();
    expect(sets[0]?.startedAt).toBe(new Date('2026-01-01T10:00:00').toISOString());
  });
});

describe('Hevy import', () => {
  it('reads kg columns, maps drop and warm-up set types', () => {
    const { format, sets } = importWorkoutCsv(HEVY, { unit: 'kg' });
    expect(format).toBe('hevy');
    expect(sets.map((set) => set.setType)).toEqual(['drop', 'warmup']);
    expect(sets[0]).toMatchObject({ workoutName: 'Pull', weight: 80, exerciseName: 'Row' });
  });
  it('converts kg to lb when the profile unit is lb', () => {
    const { sets } = importWorkoutCsv(HEVY, { unit: 'lb' });
    expect(sets[0]?.weight).toBeCloseTo(176.4, 1);
  });
});

describe('FitNotes import', () => {
  it('groups sets by day because FitNotes has no workout names', () => {
    const { format, sets } = importWorkoutCsv(FITNOTES, { unit: 'kg' });
    expect(format).toBe('fitnotes');
    expect(new Set(sets.map((set) => set.workoutId)).size).toBe(1);
    expect(sets[0]).toMatchObject({ workoutName: 'Imported workout', exerciseName: 'Squat' });
    expect(sets[0]?.weight).toBe(100);
  });
});

describe('malformed rows', () => {
  it('skips rows with bad dates, missing exercises, bad numbers, or zero reps', () => {
    const csv = [
      'Date,Workout Name,Exercise Name,Weight,Reps',
      'not a date,Day,Squat,100,5',
      '2026-01-01,Day,,100,5',
      '2026-01-01,Day,Squat,heavy,5',
      '2026-01-01,Day,Squat,100,-2',
      '2026-01-01,Day,Squat,100,0',
      '2026-01-01,Day,Squat,135,5',
      '2026-01-01,Day,Squat,,5',
    ].join('\n');
    const { sets, skipped } = importWorkoutCsv(csv);
    expect(skipped).toBe(5);
    expect(sets.map((set) => set.weight)).toEqual([135, 0]);
  });
  it('tolerates short rows and blank lines', () => {
    const csv = 'Date,Workout Name,Exercise Name,Weight,Reps\n\n2026-01-01,Day,Squat\n';
    const { sets, skipped } = importWorkoutCsv(csv);
    expect(sets).toHaveLength(0);
    expect(skipped).toBe(1);
  });
});

describe('re-importing the same file', () => {
  it('produces identical ids so the database can ignore duplicates', () => {
    const first = importWorkoutCsv(STRONG).sets.map((set) => set.id);
    const second = importWorkoutCsv(STRONG).sets.map((set) => set.id);
    expect(second).toEqual(first);
    expect(new Set(first).size).toBe(first.length);
  });
  it('keeps identical rows within one file as separate sets', () => {
    const csv = [
      'Date,Workout Name,Exercise Name,Weight,Reps',
      '2026-01-01,Day,Squat,135,5',
      '2026-01-01,Day,Squat,135,5',
    ].join('\n');
    const { sets } = importWorkoutCsv(csv);
    expect(sets).toHaveLength(2);
    expect(sets[0]?.id).not.toBe(sets[1]?.id);
  });
  it('gives different workout ids to different workouts', () => {
    const strong = importWorkoutCsv(STRONG).sets[0]!;
    const other = importWorkoutCsv(STRONG.replace('Push, heavy', 'Pull')).sets[0]!;
    expect(other.workoutId).not.toBe(strong.workoutId);
  });
});

describe('JSON export', () => {
  it('exports every supplied table in versioned JSON', () => {
    const parsed = JSON.parse(
      exportAllData({ workouts: [{ id: '1' }], settings: [] }, '2026-01-01'),
    );
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.exportedAt).toBe('2026-01-01');
    expect(parsed.tables.workouts).toEqual([{ id: '1' }]);
  });
});

describe('date-only rows', () => {
  it('reads a calendar date as local midnight, not UTC midnight', () => {
    const csv = 'Date,Exercise,Category,Weight,Reps\n2026-10-01,Squat,Legs,100,5';
    expect(importWorkoutCsv(csv, { unit: 'lb' }).sets[0]?.startedAt).toBe(
      new Date(2026, 9, 1).toISOString(),
    );
  });
});
