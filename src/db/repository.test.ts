// Runs the repository against a real SQLite file. node:sqlite is only used in tests;
// the adapter mirrors the expo-sqlite async methods the app calls.
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SQLiteDatabase } from 'expo-sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrate } from './migrations';
import {
  addBodyweight,
  draftFromRoutine,
  finishDraft,
  getProfile,
  getSetting,
  listBodyweight,
  listCompletedWorkouts,
  loadActivePlan,
  loadDraft,
  saveActivePlan,
  saveDraft,
  saveImport,
  setSetting,
  updateProfile,
  type SessionDraft,
} from './repository';
import { importWorkoutCsv } from '@/domain/importExport';
import { nextRoutine, starterTemplates } from '@/domain/plans';

function adapt(raw: DatabaseSync) {
  const adapter = {
    async runAsync(sql: string, ...params: unknown[]) {
      const result = raw.prepare(sql).run(...(params as never[]));
      return { changes: Number(result.changes), lastInsertRowid: result.lastInsertRowid };
    },
    async getAllAsync(sql: string, ...params: unknown[]) {
      return raw.prepare(sql).all(...(params as never[])) as unknown[];
    },
    async getFirstAsync(sql: string, ...params: unknown[]) {
      return (raw.prepare(sql).get(...(params as never[])) ?? null) as unknown;
    },
    async execAsync(sql: string) {
      raw.exec(sql);
    },
    async withTransactionAsync(task: () => Promise<void>) {
      raw.exec('BEGIN');
      try {
        await task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return adapter as unknown as SQLiteDatabase;
}

let dir: string;
let file: string;
let raw: DatabaseSync;
let database: SQLiteDatabase;

const openDatabase = async () => {
  raw = new DatabaseSync(file);
  database = adapt(raw);
  await migrate(database);
};

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), 'lift-db-'));
  file = join(dir, 'lift.db');
  await openDatabase();
});

afterEach(() => {
  raw.close();
  rmSync(dir, { recursive: true, force: true });
});

/** Closes and reopens the file, the same as the app being killed and relaunched. */
const restart = async () => {
  raw.close();
  await openDatabase();
};

const draftWith = (overrides: Partial<SessionDraft> = {}): SessionDraft => ({
  workoutId: 'workout-test-1',
  name: 'Full Body A',
  startedAt: '2026-10-01T10:00:00.000Z',
  notes: 'felt good',
  exercises: [
    {
      id: '0001',
      name: '3/4 sit-up',
      reason: 'Plan 3×10',
      restSeconds: 60,
      sets: [
        { id: 's1', weight: 0, reps: 10, targetReps: 10, done: true },
        { id: 's2', weight: 0, reps: 10, targetReps: 10, done: false },
      ],
    },
    {
      id: 'custom-lunge',
      name: 'Lunge',
      reason: 'Plan 2×8',
      restSeconds: 90,
      sets: [{ id: 's3', weight: 35, reps: 8, targetReps: 8, done: true, rir: 2 }],
    },
  ],
  ...overrides,
});

describe('session draft survives restart', () => {
  it('reloads the in-flight draft after the database is reopened', async () => {
    await saveDraft(database, draftWith());
    await restart();
    const loaded = await loadDraft(database);
    expect(loaded).toEqual(draftWith());
  });

  it('finishing writes only done sets to history and clears the draft', async () => {
    await saveDraft(database, draftWith());
    await finishDraft(database, draftWith());
    await restart();

    expect(await loadDraft(database)).toBeNull();
    const history = await listCompletedWorkouts(database);
    expect(history).toHaveLength(1);
    expect(history[0]?.sets.map((set) => set.exerciseName)).toEqual(['3/4 sit-up', 'Lunge']);
    expect(history[0]?.sets[1]).toMatchObject({ weight: 35, reps: 8 });
  });

  it('a draft that is never finished does not appear in history', async () => {
    await saveDraft(database, draftWith());
    await restart();
    expect(await listCompletedWorkouts(database)).toEqual([]);
  });
});

describe('plans and routines', () => {
  it('saves a template as rotation routines and reads back the next day', async () => {
    const template = starterTemplates.find((item) => item.id === 'upper-lower-4')!;
    await saveActivePlan(database, template, 60);
    await restart();

    const plan = await loadActivePlan(database);
    expect(plan.days.map((day) => day.name)).toEqual([
      'Upper / Lower — 4 day · Day 1',
      'Upper / Lower — 4 day · Day 2',
      'Upper / Lower — 4 day · Day 3',
      'Upper / Lower — 4 day · Day 4',
    ]);
    expect(plan.days[0]?.exerciseCount).toBeGreaterThan(0);
    const first = nextRoutine(plan.schedule, new Date(), plan.completedRoutineIds);
    expect(first?.id).toBe(plan.days[0]?.routineId);
  });

  it('after finishing day 1 the next routine is day 2', async () => {
    const template = starterTemplates.find((item) => item.id === 'upper-lower-4')!;
    await saveActivePlan(database, template, 60);
    const before = await loadActivePlan(database);
    const day1 = before.days[0]!;
    const draft = await draftFromRoutine(database, day1.routineId, day1.name);
    await finishDraft(database, { ...draft, exercises: [] });

    const after = await loadActivePlan(database);
    const next = nextRoutine(after.schedule, new Date(), after.completedRoutineIds);
    expect(next?.id).toBe(before.days[1]?.routineId);
  });

  it('replacing the plan soft-deletes the previous routines', async () => {
    const [first, second] = starterTemplates;
    await saveActivePlan(database, first!, 60);
    await saveActivePlan(database, second!, 45);
    const plan = await loadActivePlan(database);
    expect(plan.days.every((day) => day.name.startsWith(second!.name))).toBe(true);
    const deleted = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM routines WHERE deleted_at IS NOT NULL',
    );
    expect(deleted?.count).toBe(first!.days.length);
  });

  it('the plan builds a session draft that carries plan targets and rest', async () => {
    const template = starterTemplates.find((item) => item.id === 'full-3')!;
    await saveActivePlan(database, template, 60);
    const plan = await loadActivePlan(database);
    const draft = await draftFromRoutine(database, plan.days[0]!.routineId, plan.days[0]!.name);
    expect(draft.exercises.length).toBe(plan.days[0]!.exerciseCount);
    expect(draft.exercises[0]?.reason).toMatch(/^Plan \d+×/);
    expect(draft.exercises[0]?.sets.every((set) => !set.done)).toBe(true);
  });
});

describe('profile, settings, bodyweight', () => {
  it('stores unit and session length and reads them back after restart', async () => {
    expect(await getProfile(database)).toEqual({ unit: 'lb', sessionMinutes: 60 });
    await updateProfile(database, { unit: 'kg', sessionMinutes: 90 });
    await restart();
    expect(await getProfile(database)).toEqual({ unit: 'kg', sessionMinutes: 90 });
  });

  it('keeps settings values by key and overwrites on update', async () => {
    await setSetting(database, 'bodyweightGoal', 178);
    await setSetting(database, 'bodyweightGoal', 176);
    await restart();
    expect(await getSetting<number>(database, 'bodyweightGoal')).toBe(176);
    expect(await getSetting(database, 'missing')).toBeNull();
  });

  it('keeps bodyweight entries in date order across restarts', async () => {
    await addBodyweight(database, 182.4, 'lb');
    await addBodyweight(database, 181.9, 'lb');
    await restart();
    const entries = await listBodyweight(database);
    expect(entries.map((entry) => entry.weight)).toEqual([182.4, 181.9]);
  });
});

describe('imports against SQLite', () => {
  const csv = [
    'Date,Workout Name,Exercise Name,Weight,Reps',
    '2026-01-01 10:00:00,Push,Test Press,135,5',
    '2026-01-01 10:00:00,Push,Test Press,135,5',
    '2026-01-01 10:00:00,Push,Test Carry,35,8',
    '2026-01-01 10:00:00,Push,Test Carry,oops,8',
  ].join('\n');

  it('importing the same file twice adds no duplicate sets', async () => {
    const first = await saveImport(database, importWorkoutCsv(csv));
    expect(first).toMatchObject({ inserted: 3, duplicates: 0, skipped: 1 });
    await restart();
    const second = await saveImport(database, importWorkoutCsv(csv));
    expect(second).toMatchObject({ inserted: 0, duplicates: 3, skipped: 1 });
    const history = await listCompletedWorkouts(database);
    expect(history).toHaveLength(1);
    expect(history[0]?.sets).toHaveLength(3);
  });

  it('creates custom exercise rows for names outside the bundled library', async () => {
    await saveImport(database, importWorkoutCsv(csv));
    const custom = await database.getAllAsync<{ name: string }>(
      'SELECT name FROM custom_exercises',
    );
    expect(custom.map((row) => row.name).sort()).toEqual(['Test Carry', 'Test Press']);
  });
});
