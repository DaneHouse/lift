import type { SQLiteDatabase } from 'expo-sqlite';
import type { Unit } from '@/domain/importExport';
import {
  injuriesToCheck,
  planInjurySession,
  rehabExerciseId,
  type CheckinInput,
  type CheckinRecord,
  type Injury,
  type InjuryArea,
  type InjurySide,
  type InjuryStage,
  type InjuryStatus,
  type RehabItem,
  type RehabLog,
  type SessionLift,
} from '@/domain/injuries';
import type { SessionExercise } from '@/domain/session';
import { defaultIncrement, planExtras, swapPlan, type ExercisePlan } from '@/domain/targets';
import { LOCAL_USER, newId, now } from './common';
import { getExercise } from './library';
import type { SessionDraft } from './repository';
import { buildSessionExercise } from './targets';

type InjuryRow = {
  id: string;
  area: InjuryArea;
  side: InjurySide;
  stage: InjuryStage;
  status: InjuryStatus;
  description: string | null;
  started_at: string;
  stage_since: string | null;
};

const fromRow = (row: InjuryRow): Injury => ({
  id: row.id,
  area: row.area,
  side: row.side,
  stage: row.stage,
  status: row.status,
  description: row.description ?? '',
  startedAt: row.started_at,
  stageSince: row.stage_since ?? row.started_at,
});

/** Active and referred injuries. Resolved ones are kept in the table but hidden unless asked for. */
export async function listInjuries(
  database: SQLiteDatabase,
  options: { includeResolved?: boolean } = {},
): Promise<Injury[]> {
  const rows = await database.getAllAsync<InjuryRow>(
    `SELECT id, area, side, stage, status, description, started_at, stage_since FROM injuries
     WHERE user_id = ? AND deleted_at IS NULL ${options.includeResolved ? '' : "AND status != 'resolved'"}
     ORDER BY started_at ASC, rowid ASC`,
    LOCAL_USER,
  );
  return rows.map(fromRow);
}

export async function addInjury(
  database: SQLiteDatabase,
  input: { area: InjuryArea; side: InjurySide; stage: InjuryStage; description: string },
  startedAt = now(),
) {
  const id = newId('injury');
  await database.runAsync(
    'INSERT INTO injuries (id,user_id,area,side,stage,description,started_at,status,stage_since,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    id,
    LOCAL_USER,
    input.area,
    input.side,
    input.stage,
    input.description.trim() || null,
    startedAt,
    'active',
    startedAt,
    now(),
  );
  return id;
}

export async function setInjuryStage(database: SQLiteDatabase, id: string, stage: InjuryStage) {
  const stamp = now();
  await database.runAsync(
    'UPDATE injuries SET stage = ?, stage_since = ?, updated_at = ? WHERE id = ?',
    stage,
    stamp,
    stamp,
    id,
  );
}

export async function setInjuryStatus(database: SQLiteDatabase, id: string, status: InjuryStatus) {
  await database.runAsync(
    'UPDATE injuries SET status = ?, updated_at = ? WHERE id = ?',
    status,
    now(),
    id,
  );
}

/** The user says a clinician has looked at it: back to the protect stage, loading allowed again. */
export async function clearReferral(database: SQLiteDatabase, id: string) {
  const stamp = now();
  await database.runAsync(
    "UPDATE injuries SET status = 'active', stage = 'protect', stage_since = ?, updated_at = ? WHERE id = ?",
    stamp,
    stamp,
    id,
  );
}

export async function deleteInjury(database: SQLiteDatabase, id: string) {
  const stamp = now();
  await database.runAsync(
    'UPDATE injuries SET deleted_at = ?, updated_at = ? WHERE id = ?',
    stamp,
    stamp,
    id,
  );
}

export async function saveCheckin(
  database: SQLiteDatabase,
  input: { injuryId: string; workoutId?: string; score: number; notes?: string },
  checkedAt = now(),
) {
  await database.runAsync(
    'INSERT INTO injury_checkins (id,user_id,injury_id,workout_id,score,pain_notes,checked_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',
    newId('checkin'),
    LOCAL_USER,
    input.injuryId,
    input.workoutId ?? null,
    input.score,
    input.notes?.trim() || null,
    checkedAt,
    now(),
  );
}

export async function listCheckins(
  database: SQLiteDatabase,
  injuryId: string,
): Promise<CheckinRecord[]> {
  const rows = await database.getAllAsync<{ checked_at: string; score: number }>(
    'SELECT checked_at, score FROM injury_checkins WHERE injury_id = ? AND deleted_at IS NULL ORDER BY checked_at ASC',
    injuryId,
  );
  return rows.map((row) => ({ date: row.checked_at, score: row.score }));
}

export async function listRehabLogs(
  database: SQLiteDatabase,
  injuryId: string,
): Promise<RehabLog[]> {
  const rows = await database.getAllAsync<{
    performed_at: string;
    completed: number;
    easy: number;
  }>(
    'SELECT performed_at, completed, easy FROM injury_rehab_logs WHERE injury_id = ? AND deleted_at IS NULL ORDER BY performed_at ASC',
    injuryId,
  );
  return rows.map((row) => ({
    date: row.performed_at,
    completed: row.completed === 1,
    easy: row.easy === 1,
  }));
}

/** One log row per injury whose rehab block was in the finished session. Call inside finishDraft. */
export async function logRehabForDraft(
  database: SQLiteDatabase,
  draft: Pick<SessionDraft, 'workoutId' | 'exercises'>,
  performedAt: string,
) {
  const byInjury = new Map<string, SessionExercise[]>();
  for (const exercise of draft.exercises) {
    if (!exercise.rehab) continue;
    byInjury.set(exercise.rehab.injuryId, [
      ...(byInjury.get(exercise.rehab.injuryId) ?? []),
      exercise,
    ]);
  }
  for (const [injuryId, slots] of byInjury) {
    const sets = slots.flatMap((slot) => (slot.skipped ? [] : slot.sets));
    const skipped = slots.some((slot) => slot.skipped);
    const done = sets.filter((set) => set.done);
    const completed = !skipped && sets.length > 0 && done.length === sets.length;
    const easy = done.every((set) => set.rir === undefined || set.rir >= 2);
    await database.runAsync(
      'INSERT INTO injury_rehab_logs (id,user_id,injury_id,workout_id,completed,easy,performed_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',
      newId('rehablog'),
      LOCAL_USER,
      injuryId,
      draft.workoutId,
      completed ? 1 : 0,
      easy ? 1 : 0,
      performedAt,
      performedAt,
    );
  }
}

// ---- building the injury-aware session ------------------------------------------------

async function liftsOf(database: SQLiteDatabase, draft: SessionDraft): Promise<SessionLift[]> {
  const lifts: SessionLift[] = [];
  for (const exercise of draft.exercises) {
    const record = await getExercise(database, exercise.id);
    lifts.push({
      id: exercise.id,
      name: exercise.name,
      muscles: [...(record?.primaryMuscles ?? []), ...(record?.secondaryMuscles ?? [])],
    });
  }
  return lifts;
}

/** Active injuries that today's session loads, so the check-in screen should ask about them. */
export async function injuriesNeedingCheckin(database: SQLiteDatabase, draft: SessionDraft) {
  const injuries = await listInjuries(database);
  return injuriesToCheck(injuries, await liftsOf(database, draft));
}

function rehabPlan(item: RehabItem, unit: Unit): ExercisePlan {
  if (item.mode === 'time')
    return {
      ...planExtras,
      policy: 'time',
      sets: item.sets,
      repMin: 0,
      repMax: 0,
      increment: 5,
      seconds: item.amount,
    };
  return {
    ...planExtras,
    policy: 'double',
    sets: item.sets,
    repMin: item.amount,
    repMax: item.amount + 5,
    increment: defaultIncrement(unit),
    seconds: 0,
  };
}

const REHAB_REST_SECONDS = 45;

/**
 * Applies the check-in to a freshly built draft: rehab block first, flagged lifts swapped
 * for safer variations or skipped, notices for anything the user should read before lifting.
 */
export async function applyInjuryPlan(
  database: SQLiteDatabase,
  draft: SessionDraft,
  unit: Unit,
  checkins: Record<string, CheckinInput>,
): Promise<SessionDraft> {
  const injuries = await listInjuries(database);
  const plan = planInjurySession(injuries, checkins, await liftsOf(database, draft));

  const body: SessionExercise[] = [];
  for (const slot of draft.exercises) {
    const skip = plan.skips[slot.id];
    const swap = plan.swaps[slot.id];
    if (skip) {
      body.push({ ...slot, skipped: true, reason: `Skipped: ${skip}` });
    } else if (swap) {
      const built = await buildSessionExercise(database, {
        slotId: slot.slotId,
        exercise: { id: swap.to.id, name: swap.to.name },
        plan: swapPlan(slot.plan, swap.to.mode, unit),
        restSeconds: slot.restSeconds,
        unit,
      });
      body.push({
        ...built,
        reason: `Swapped from ${slot.name}: ${swap.why}. ${built.reason}`,
        swappedFrom: slot.name,
      });
    } else body.push(slot);
  }

  const rehab: SessionExercise[] = [];
  for (const block of plan.rehab)
    for (const item of block.items) {
      const built = await buildSessionExercise(database, {
        slotId: newId('slot'),
        exercise: { id: rehabExerciseId(item), name: item.name },
        plan: rehabPlan(item, unit),
        restSeconds: REHAB_REST_SECONDS,
        unit,
      });
      rehab.push({
        ...built,
        reason: `Rehab ${block.stage}: ${item.cue} ${built.reason}`,
        rehab: { injuryId: block.injuryId, area: block.area },
      });
    }

  return { ...draft, exercises: [...rehab, ...body], notices: plan.notices };
}
