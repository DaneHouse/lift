import type { SQLiteDatabase } from 'expo-sqlite';
import { LOCAL_USER, now } from './common';

export async function getSetting<T>(database: SQLiteDatabase, key: string): Promise<T | null> {
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE user_id = ? AND key = ? AND deleted_at IS NULL',
    LOCAL_USER,
    key,
  );
  return row ? (JSON.parse(row.value) as T | null) : null;
}

export async function setSetting(database: SQLiteDatabase, key: string, value: unknown) {
  await database.runAsync(
    'INSERT INTO settings (id,user_id,key,value,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
    `setting-${key}`,
    LOCAL_USER,
    key,
    JSON.stringify(value),
    now(),
  );
}
