import type { SQLiteDatabase } from 'expo-sqlite';

const migration001 = `
CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, display_name TEXT, unit TEXT NOT NULL DEFAULT 'lb', session_length INTEGER NOT NULL DEFAULT 60, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS exercises (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL, primary_muscles TEXT NOT NULL, secondary_muscles TEXT NOT NULL, equipment TEXT, instructions TEXT NOT NULL, category TEXT, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS custom_exercises (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL, primary_muscles TEXT NOT NULL, secondary_muscles TEXT NOT NULL, equipment TEXT, instructions TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS exercise_refs (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, exercise_id TEXT NOT NULL, kind TEXT NOT NULL, uri TEXT NOT NULL, title TEXT, thumbnail_uri TEXT, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS routines (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL, notes TEXT, template_key TEXT, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS routine_items (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, routine_id TEXT NOT NULL, exercise_id TEXT NOT NULL, sets INTEGER NOT NULL, reps INTEGER, rep_min INTEGER, rep_max INTEGER, seconds INTEGER, policy TEXT NOT NULL, increment REAL NOT NULL DEFAULT 5, rest_seconds INTEGER NOT NULL DEFAULT 90, superset_group TEXT, set_type TEXT NOT NULL DEFAULT 'normal', sort_order INTEGER NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS schedules (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, routine_id TEXT NOT NULL, mode TEXT NOT NULL, weekday INTEGER, rotation_order INTEGER, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS workouts (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, routine_id TEXT, name TEXT NOT NULL, started_at TEXT NOT NULL, completed_at TEXT, notes TEXT, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS workout_sets (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, workout_id TEXT NOT NULL, exercise_id TEXT NOT NULL, weight REAL, reps INTEGER, seconds INTEGER, rir REAL, done INTEGER NOT NULL DEFAULT 0, warmup INTEGER NOT NULL DEFAULT 0, set_type TEXT NOT NULL DEFAULT 'normal', sort_order INTEGER NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS bodyweight (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, measured_at TEXT NOT NULL, weight REAL NOT NULL, unit TEXT NOT NULL, goal REAL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS injuries (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, area TEXT NOT NULL, side TEXT NOT NULL, stage TEXT NOT NULL, description TEXT, started_at TEXT NOT NULL, status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS injury_checkins (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, injury_id TEXT NOT NULL, workout_id TEXT, score INTEGER NOT NULL, pain_notes TEXT, checked_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS health_daily (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, date TEXT NOT NULL, sleep_min INTEGER, rhr REAL, hrv REAL, steps INTEGER, body_battery INTEGER, source TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS coach_threads (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, title TEXT NOT NULL, messages TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS coach_proposals (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, thread_id TEXT, proposal TEXT NOT NULL, status TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE UNIQUE INDEX IF NOT EXISTS settings_user_key ON settings (user_id, key);
CREATE TABLE IF NOT EXISTS progress_photos (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, taken_at TEXT NOT NULL, uri TEXT NOT NULL, notes TEXT, updated_at TEXT NOT NULL, deleted_at TEXT);
CREATE INDEX IF NOT EXISTS workout_sets_workout_id ON workout_sets (workout_id);
CREATE INDEX IF NOT EXISTS workout_sets_exercise_id ON workout_sets (exercise_id);
CREATE INDEX IF NOT EXISTS routine_items_routine_id ON routine_items (routine_id);
CREATE INDEX IF NOT EXISTS schedules_user_mode ON schedules (user_id, mode);
`;

export async function migrate(database: SQLiteDatabase) {
  const version = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((version?.user_version ?? 0) < 1) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(migration001);
      await database.execAsync('PRAGMA user_version = 1');
    });
  }
}
