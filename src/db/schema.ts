import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const syncColumns = {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
};

export const profiles = sqliteTable('profiles', {
  ...syncColumns,
  displayName: text('display_name'),
  unit: text('unit', { enum: ['lb', 'kg'] })
    .notNull()
    .default('lb'),
  sessionLength: integer('session_length').notNull().default(60),
});

export const exercises = sqliteTable('exercises', {
  ...syncColumns,
  name: text('name').notNull(),
  primaryMuscles: text('primary_muscles', { mode: 'json' }).$type<string[]>().notNull(),
  secondaryMuscles: text('secondary_muscles', { mode: 'json' }).$type<string[]>().notNull(),
  equipment: text('equipment'),
  instructions: text('instructions', { mode: 'json' }).$type<string[]>().notNull(),
  category: text('category'),
});

export const customExercises = sqliteTable('custom_exercises', {
  ...syncColumns,
  name: text('name').notNull(),
  primaryMuscles: text('primary_muscles', { mode: 'json' }).$type<string[]>().notNull(),
  secondaryMuscles: text('secondary_muscles', { mode: 'json' }).$type<string[]>().notNull(),
  equipment: text('equipment'),
  instructions: text('instructions', { mode: 'json' }).$type<string[]>().notNull(),
  mode: text('mode', { enum: ['reps', 'time', 'cardio'] })
    .notNull()
    .default('reps'),
});

export const exerciseRefs = sqliteTable('exercise_refs', {
  ...syncColumns,
  exerciseId: text('exercise_id').notNull(),
  kind: text('kind', { enum: ['url', 'photo', 'video'] }).notNull(),
  uri: text('uri').notNull(),
  title: text('title'),
  thumbnailUri: text('thumbnail_uri'),
});

export const routines = sqliteTable('routines', {
  ...syncColumns,
  name: text('name').notNull(),
  notes: text('notes'),
  templateKey: text('template_key'),
});

export const routineItems = sqliteTable('routine_items', {
  ...syncColumns,
  routineId: text('routine_id').notNull(),
  exerciseId: text('exercise_id').notNull(),
  sets: integer('sets').notNull(),
  reps: integer('reps'),
  repMin: integer('rep_min'),
  repMax: integer('rep_max'),
  seconds: integer('seconds'),
  policy: text('policy').notNull(),
  increment: real('increment').notNull().default(5),
  restSeconds: integer('rest_seconds').notNull().default(90),
  targetRir: real('target_rir'),
  backoffPercent: real('backoff_percent'),
  trainingMax: real('training_max'),
  deloadEvery: integer('deload_every').notNull().default(0),
  supersetGroup: text('superset_group'),
  setType: text('set_type', { enum: ['normal', 'warmup', 'drop'] })
    .notNull()
    .default('normal'),
  order: integer('sort_order').notNull(),
});

export const schedules = sqliteTable('schedules', {
  ...syncColumns,
  routineId: text('routine_id').notNull(),
  mode: text('mode', { enum: ['weekday', 'rotation'] }).notNull(),
  weekday: integer('weekday'),
  rotationOrder: integer('rotation_order'),
});

export const workouts = sqliteTable('workouts', {
  ...syncColumns,
  routineId: text('routine_id'),
  name: text('name').notNull(),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  notes: text('notes'),
});

export const workoutSets = sqliteTable('workout_sets', {
  ...syncColumns,
  workoutId: text('workout_id').notNull(),
  exerciseId: text('exercise_id').notNull(),
  weight: real('weight'),
  reps: integer('reps'),
  seconds: integer('seconds'),
  rir: real('rir'),
  done: integer('done', { mode: 'boolean' }).notNull().default(false),
  warmup: integer('warmup', { mode: 'boolean' }).notNull().default(false),
  setType: text('set_type', { enum: ['normal', 'warmup', 'drop'] })
    .notNull()
    .default('normal'),
  order: integer('sort_order').notNull(),
});

export const bodyweight = sqliteTable('bodyweight', {
  ...syncColumns,
  measuredAt: text('measured_at').notNull(),
  weight: real('weight').notNull(),
  unit: text('unit', { enum: ['lb', 'kg'] }).notNull(),
  goal: real('goal'),
});

export const injuries = sqliteTable('injuries', {
  ...syncColumns,
  area: text('area').notNull(),
  side: text('side', { enum: ['left', 'right', 'both', 'center'] }).notNull(),
  stage: text('stage', { enum: ['protect', 'restore', 'rebuild', 'return'] }).notNull(),
  description: text('description'),
  startedAt: text('started_at').notNull(),
  status: text('status', { enum: ['active', 'resolved'] }).notNull(),
});

export const injuryCheckins = sqliteTable('injury_checkins', {
  ...syncColumns,
  injuryId: text('injury_id').notNull(),
  workoutId: text('workout_id'),
  score: integer('score').notNull(),
  painNotes: text('pain_notes'),
  checkedAt: text('checked_at').notNull(),
});

export const healthDaily = sqliteTable('health_daily', {
  ...syncColumns,
  date: text('date').notNull(),
  sleepMin: integer('sleep_min'),
  rhr: real('rhr'),
  hrv: real('hrv'),
  steps: integer('steps'),
  bodyBattery: integer('body_battery'),
  source: text('source').notNull(),
});

export const coachThreads = sqliteTable('coach_threads', {
  ...syncColumns,
  title: text('title').notNull(),
  messages: text('messages', { mode: 'json' }).$type<unknown[]>().notNull(),
});

export const coachProposals = sqliteTable('coach_proposals', {
  ...syncColumns,
  threadId: text('thread_id'),
  proposal: text('proposal', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  status: text('status', { enum: ['pending', 'accepted', 'rejected'] }).notNull(),
});

export const settings = sqliteTable(
  'settings',
  {
    ...syncColumns,
    key: text('key').notNull(),
    value: text('value', { mode: 'json' }).$type<unknown>().notNull(),
  },
  (table) => [uniqueIndex('settings_user_key').on(table.userId, table.key)],
);

export const progressPhotos = sqliteTable('progress_photos', {
  ...syncColumns,
  takenAt: text('taken_at').notNull(),
  uri: text('uri').notNull(),
  notes: text('notes'),
});

export const schema = {
  profiles,
  exercises,
  customExercises,
  exerciseRefs,
  routines,
  routineItems,
  schedules,
  workouts,
  workoutSets,
  bodyweight,
  injuries,
  injuryCheckins,
  healthDaily,
  coachThreads,
  coachProposals,
  settings,
  progressPhotos,
};
