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
import { type ExercisePlan } from '@/domain/targets';
import {
  addReference,
  deleteCustomExercise,
  deleteReference,
  listReferences,
  getExercise,
  getFavourites,
  listAllExercises,
  saveCustomExercise,
  toggleFavourite,
} from './library';
import {
  getPlateSetup,
  getRestDefault,
  listRoutineItems,
  saveRoutineItem,
  savePlateSetup,
  setRestDefault,
} from './repository';

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

const PLAN = {
  policy: 'double' as const,
  sets: 2,
  repMin: 8,
  repMax: 12,
  increment: 5,
  seconds: 0,
};

const draftWith = (overrides: Partial<SessionDraft> = {}): SessionDraft => ({
  workoutId: 'workout-test-1',
  name: 'Full Body A',
  startedAt: '2026-10-01T10:00:00.000Z',
  notes: 'felt good',
  exercises: [
    {
      slotId: 'slot-1',
      id: '0001',
      name: '3/4 sit-up',
      reason: 'Plan 3×10',
      restSeconds: 60,
      kind: 'reps',
      plan: PLAN,
      sets: [
        { id: 's1', weight: 0, reps: 10, targetReps: 10, done: true },
        { id: 's2', weight: 0, reps: 10, targetReps: 10, done: false },
      ],
    },
    {
      slotId: 'slot-2',
      id: 'custom-lunge',
      name: 'Lunge',
      reason: 'Plan 2×8',
      restSeconds: 90,
      kind: 'reps',
      plan: PLAN,
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
    const draft = await draftFromRoutine(database, day1.routineId, day1.name, 'lb');
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
    const draft = await draftFromRoutine(
      database,
      plan.days[0]!.routineId,
      plan.days[0]!.name,
      'lb',
    );
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

describe('progression drives the session', () => {
  /** Logs every set of the named slot as done, at the given load (time slots keep their hold). */
  const completeSlot = (draft: SessionDraft, name: string, weight: number): SessionDraft => ({
    ...draft,
    exercises: draft.exercises.map((exercise) =>
      exercise.name === name
        ? {
            ...exercise,
            sets: exercise.sets.map((set) => ({ ...set, weight, done: true })),
          }
        : exercise,
    ),
  });

  it('finishing a session feeds the next target for that exercise', async () => {
    const template = starterTemplates.find((item) => item.id === '5x5')!;
    await saveActivePlan(database, template, 60);
    const routineId = (await loadActivePlan(database)).days[0]!.routineId;

    const first = await draftFromRoutine(database, routineId, 'Day 1', 'lb');
    const squat = first.exercises.find((exercise) => exercise.name === 'Back squat')!;
    expect(squat.reason).toMatch(/no history yet/);
    expect(squat.sets).toHaveLength(5);

    await finishDraft(database, completeSlot(first, 'Back squat', 135));
    await restart();

    const next = await draftFromRoutine(database, routineId, 'Day 1', 'lb');
    const squatNext = next.exercises.find((exercise) => exercise.name === 'Back squat')!;
    expect(squatNext.reason).toBe('Hit 5x5 last time → +5 lb');
    expect(squatNext.sets[0]).toMatchObject({ weight: 140, reps: 5 });
  });

  it('a timed hold that is held adds seconds next session', async () => {
    const template = starterTemplates.find((item) => item.id === '5x5')!;
    await saveActivePlan(database, template, 60);
    const routineId = (await loadActivePlan(database)).days[0]!.routineId;

    const first = await draftFromRoutine(database, routineId, 'Day 1', 'lb');
    const plank = first.exercises.find((exercise) => exercise.name === 'Plank')!;
    expect(plank.kind).toBe('time');
    expect(plank.sets[0]?.seconds).toBe(30);
    await finishDraft(database, completeSlot(first, 'Plank', 0));

    const next = await draftFromRoutine(database, routineId, 'Day 1', 'lb');
    const plankNext = next.exercises.find((exercise) => exercise.name === 'Plank')!;
    expect(plankNext.reason).toBe('Held all sets → +5s');
    expect(plankNext.sets[0]?.seconds).toBe(35);
  });

  it('plan editor changes persist and set the next session targets', async () => {
    const template = starterTemplates.find((item) => item.id === '5x5')!;
    await saveActivePlan(database, template, 60);
    const routineId = (await loadActivePlan(database)).days[0]!.routineId;
    const [squat] = await listRoutineItems(database, routineId);
    const edited: ExercisePlan = {
      ...squat!.plan,
      policy: 'double',
      repMin: 3,
      repMax: 5,
      sets: 4,
    };
    await saveRoutineItem(database, squat!.id, edited, 180);
    await restart();

    const [reloaded] = await listRoutineItems(database, routineId);
    expect(reloaded).toMatchObject({ name: 'Back squat', mode: 'reps', restSeconds: 180 });
    expect(reloaded?.plan).toMatchObject({ policy: 'double', repMin: 3, repMax: 5, sets: 4 });
    const draft = await draftFromRoutine(database, routineId, 'Day 1', 'lb');
    expect(draft.exercises[0]).toMatchObject({
      restSeconds: 180,
      reason: 'Plan 4×3–5 · no history yet',
    });
  });
});

describe('rest timer and plates survive restart', () => {
  it('keeps the rest end time on the draft so a relaunch shows the same countdown', async () => {
    const endsAt = '2026-10-08T12:00:00.000Z';
    await saveDraft(database, { ...draftWith(), restEndsAt: endsAt });
    await restart();
    expect((await loadDraft(database))?.restEndsAt).toBe(endsAt);
  });

  it('keeps the default rest and per-unit plate setups', async () => {
    expect(await getRestDefault(database)).toBe(90);
    await setRestDefault(database, 120);
    await savePlateSetup(database, 'kg', {
      bar: 'custom',
      barWeight: 15,
      inventory: [25, 10, 2.5],
      stack: [25, 10],
    });
    await restart();
    expect(await getRestDefault(database)).toBe(120);
    expect(await getPlateSetup(database, 'kg')).toEqual({
      bar: 'custom',
      barWeight: 15,
      inventory: [25, 10, 2.5],
      stack: [25, 10],
    });
    expect((await getPlateSetup(database, 'lb')).inventory).toEqual([45, 35, 25, 10, 5, 2.5]);
  });
});

describe('exercise library', () => {
  it('lists the bundled library and live custom exercises only', async () => {
    const all = await listAllExercises(database);
    expect(all.length).toBeGreaterThan(1300);
    const id = await saveCustomExercise(database, {
      name: 'Landmine press',
      primaryMuscles: ['shoulders'],
      secondaryMuscles: ['triceps'],
      equipment: 'barbell',
      mode: 'reps',
    });
    expect((await listAllExercises(database)).at(-1)).toMatchObject({ id, custom: true });
    await deleteCustomExercise(database, id);
    expect((await listAllExercises(database)).some((item) => item.id === id)).toBe(false);
    // The row stays so history can still show its name.
    expect((await getExercise(database, id))?.name).toBe('Landmine press');
  });

  it('edits a custom exercise and keeps its mode after restart', async () => {
    const id = await saveCustomExercise(database, {
      name: 'Hollow hold',
      primaryMuscles: ['abs'],
      secondaryMuscles: [],
      equipment: 'body weight',
      mode: 'reps',
    });
    await saveCustomExercise(
      database,
      {
        name: 'Hollow hold',
        primaryMuscles: ['abs'],
        secondaryMuscles: [],
        equipment: 'body weight',
        mode: 'time',
      },
      id,
    );
    await restart();
    expect(await getExercise(database, id)).toMatchObject({ mode: 'time', custom: true });
  });

  it('favourites toggle and survive restart', async () => {
    await toggleFavourite(database, '0001');
    await toggleFavourite(database, 'custom-x');
    await toggleFavourite(database, 'custom-x');
    await restart();
    expect(await getFavourites(database)).toEqual(['0001']);
  });
});

describe('exercise references', () => {
  it('stores links per exercise, survives restart, and removes softly', async () => {
    await addReference(database, '0001', 'https://www.youtube.com/watch?v=abc', 'Form');
    await addReference(database, '0001', 'https://www.instagram.com/reel/xyz', null);
    await addReference(database, '0002', 'https://example.com', null);
    await restart();
    const links = await listReferences(database, '0001');
    expect(links).toMatchObject([
      { url: 'https://www.youtube.com/watch?v=abc', title: 'Form' },
      { url: 'https://www.instagram.com/reel/xyz', title: null },
    ]);
    await deleteReference(database, links[0]!.id);
    expect((await listReferences(database, '0001')).map((link) => link.url)).toEqual([
      'https://www.instagram.com/reel/xyz',
    ]);
  });
});
