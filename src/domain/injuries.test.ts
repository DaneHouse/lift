import { describe, expect, it } from 'vitest';
import { exerciseLibrary } from '@/data/exercises';
import {
  injuriesToCheck,
  injuryAreas,
  loadsArea,
  planInjurySession,
  rehabExerciseId,
  rehabMenus,
  stages,
  suggestStageChange,
  swapRules,
  type Injury,
  type SessionLift,
} from './injuries';

const byId = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));
const injury = (overrides: Partial<Injury> = {}): Injury => ({
  id: 'inj1',
  area: 'ankle',
  side: 'left',
  stage: 'restore',
  status: 'active',
  description: '',
  startedAt: '2026-09-01T00:00:00Z',
  stageSince: '2026-09-01T00:00:00Z',
  ...overrides,
});
const lift = (id: string, name: string, muscles: string[] = []): SessionLift => ({
  id,
  name,
  muscles,
});

describe('rehab menus', () => {
  it('has 2-3 items for every area and stage', () => {
    for (const area of injuryAreas)
      for (const stage of stages) {
        const count = rehabMenus[area.value][stage.value].length;
        expect(count, `${area.value}/${stage.value}`).toBeGreaterThanOrEqual(2);
        expect(count, `${area.value}/${stage.value}`).toBeLessThanOrEqual(3);
      }
  });
  it('library ids exist and agree with the library mode', () => {
    for (const area of injuryAreas)
      for (const stage of stages)
        for (const item of rehabMenus[area.value][stage.value]) {
          if (!item.libraryId) continue;
          const entry = byId.get(item.libraryId);
          expect(entry, `${item.name} (${item.libraryId})`).toBeDefined();
          expect(entry?.mode, item.name).toBe(item.mode);
        }
  });
  it('items without a library id get a stable custom id', () => {
    expect(rehabExerciseId({ name: 'Wall sit' })).toBe('custom-wall-sit');
    expect(rehabExerciseId({ name: 'x', libraryId: '0031' })).toBe('0031');
  });
  it('swap targets exist in the library and are logged by reps', () => {
    for (const rules of Object.values(swapRules))
      for (const rule of rules) {
        expect(byId.get(rule.to.id), rule.to.name).toBeDefined();
        expect(byId.get(rule.to.id)?.mode).toBe(rule.to.mode);
      }
  });
});

describe('which lifts load an area', () => {
  it('matches by muscle or by movement name', () => {
    expect(loadsArea('knee', lift('a', 'barbell full squat', ['quads']))).toBe(true);
    expect(loadsArea('knee', lift('b', 'Back squat'))).toBe(true);
    expect(loadsArea('knee', lift('c', 'Biceps curl', ['biceps']))).toBe(false);
    expect(loadsArea('shoulder', lift('d', 'Overhead press', ['delts']))).toBe(true);
  });
  it('only asks for a check-in on active injuries the session loads', () => {
    const lifts = [lift('s', 'Back squat', ['quads'])];
    const injuries = [
      injury({ id: 'k', area: 'knee' }),
      injury({ id: 'e', area: 'elbow-wrist' }),
      injury({ id: 'done', area: 'knee', status: 'resolved' }),
    ];
    expect(injuriesToCheck(injuries, lifts).map((entry) => entry.id)).toEqual(['k']);
  });
});

describe('planInjurySession', () => {
  const lifts = [
    lift('squat', 'Back squat', ['quads']),
    lift('curl', 'Biceps curl', ['biceps']),
    lift('calf', 'Standing calf raise', ['calves']),
  ];

  it('adds the rehab block at the current stage when the session loads the area', () => {
    const plan = planInjurySession([injury({ stage: 'rebuild' })], {}, lifts);
    expect(plan.rehab).toHaveLength(1);
    expect(plan.rehab[0]).toMatchObject({ injuryId: 'inj1', stage: 'rebuild' });
    expect(plan.swaps).toEqual({});
    expect(plan.skips).toEqual({});
  });

  it('adds no rehab for an area the session does not touch', () => {
    const plan = planInjurySession([injury({ area: 'neck' })], {}, lifts);
    expect(plan.rehab).toEqual([]);
  });

  it('a good check-in changes nothing', () => {
    const plan = planInjurySession([injury()], { inj1: { score: 4, redFlag: false } }, lifts);
    expect(plan.swaps).toEqual({});
    expect(plan.skips).toEqual({});
  });

  it('score under 3 swaps flagged lifts with a one-line why', () => {
    const plan = planInjurySession(
      [injury()],
      { inj1: { score: 2.5 as number, redFlag: false } },
      lifts,
    );
    expect(plan.swaps.calf?.to.name).toBe('Seated calf raise');
    expect(plan.swaps.calf?.why).toContain('check-in 2.5/5');
    expect(plan.swaps.squat?.to.name).toBe('Leg press');
    expect(plan.swaps.curl).toBeUndefined();
    expect(plan.rehab[0]?.stage).toBe('restore');
  });

  it('score under 2 is protect-only: flagged lifts skipped, protect rehab only', () => {
    const plan = planInjurySession([injury()], { inj1: { score: 1, redFlag: false } }, lifts);
    expect(Object.keys(plan.skips).sort()).toEqual(['calf', 'squat']);
    expect(plan.skips.calf).toContain('protect-only');
    expect(plan.swaps).toEqual({});
    expect(plan.rehab[0]?.stage).toBe('protect');
  });

  it('skips a lift when the safe variation is already in the session', () => {
    const withPress = [...lifts, lift('0739', 'Leg press', ['quads'])];
    const plan = planInjurySession(
      [injury({ area: 'knee' })],
      { inj1: { score: 2, redFlag: false } },
      withPress,
    );
    expect(plan.skips.squat).toContain('no safe variation');
  });

  it('a red flag stops loading the area and says to see a professional', () => {
    const plan = planInjurySession([injury()], { inj1: { score: 5, redFlag: true } }, lifts);
    expect(Object.keys(plan.skips).sort()).toEqual(['calf', 'squat']);
    expect(plan.rehab).toEqual([]);
    expect(plan.notices[0]).toContain('physio or doctor');
  });

  it('a referred injury stays off until cleared, with no rehab block', () => {
    const plan = planInjurySession([injury({ status: 'referred' })], {}, lifts);
    expect(plan.rehab).toEqual([]);
    expect(Object.keys(plan.skips).sort()).toEqual(['calf', 'squat']);
  });

  it('ignores resolved injuries', () => {
    const plan = planInjurySession([injury({ status: 'resolved' })], {}, lifts);
    expect(plan).toEqual({ rehab: [], swaps: {}, skips: {}, notices: [] });
  });
});

describe('suggestStageChange', () => {
  const now = new Date('2026-10-08T12:00:00Z');
  const day = (ago: number) => new Date(now.getTime() - ago * 86_400_000).toISOString();
  const good = {
    checkins: [1, 5, 9, 12].map((ago) => ({ date: day(ago), score: 4 })),
    logs: [1, 4, 8, 12].map((ago) => ({ date: day(ago), completed: true, easy: true })),
  };
  const restore = { stage: 'restore' as const, stageSince: day(20) };

  it('advances after two weeks of completed easy rehab and check-ins of 4+', () => {
    expect(suggestStageChange(restore, good.checkins, good.logs, now)).toMatchObject({
      action: 'advance',
      to: 'rebuild',
    });
  });
  it('suggests recovery from the return stage', () => {
    expect(
      suggestStageChange({ stage: 'return', stageSince: day(20) }, good.checkins, good.logs, now)
        .action,
    ).toBe('resolve');
  });
  it('waits when the stage is under two weeks old', () => {
    expect(
      suggestStageChange({ stage: 'restore', stageSince: day(6) }, good.checkins, good.logs, now)
        .action,
    ).toBe('none');
  });
  it('waits when rehab was not easy or a check-in was low', () => {
    const hard = good.logs.map((entry, index) => ({ ...entry, easy: index !== 0 }));
    expect(suggestStageChange(restore, good.checkins, hard, now).action).toBe('none');
    const low = [{ date: day(10), score: 3 }, ...good.checkins];
    expect(suggestStageChange(restore, low, good.logs, now).action).toBe('none');
  });
  it('waits with too few sessions', () => {
    expect(suggestStageChange(restore, good.checkins, good.logs.slice(0, 3), now).action).toBe(
      'none',
    );
  });
  it('moves back a stage on a pain report', () => {
    const checkins = [{ date: day(2), score: 2 }, ...good.checkins];
    expect(suggestStageChange(restore, checkins, good.logs, now)).toMatchObject({
      action: 'regress',
      to: 'protect',
    });
  });
  it('moves back a stage after skipped rehab', () => {
    const logs = [
      { date: day(3), completed: false, easy: true },
      { date: day(6), completed: false, easy: true },
    ];
    expect(suggestStageChange(restore, good.checkins, logs, now)).toMatchObject({
      action: 'regress',
      to: 'protect',
    });
  });
  it('never regresses below protect', () => {
    const checkins = [{ date: day(2), score: 1 }];
    expect(
      suggestStageChange({ stage: 'protect', stageSince: day(30) }, checkins, [], now).action,
    ).toBe('none');
  });
});
