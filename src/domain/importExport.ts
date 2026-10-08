export type ImportFormat = 'strong' | 'hevy' | 'fitnotes';
export type Unit = 'lb' | 'kg';
export type ImportedSet = {
  id: string;
  workoutId: string;
  workoutName: string;
  startedAt: string;
  exerciseName: string;
  weight: number;
  reps: number;
  seconds?: number | undefined;
  rir?: number | undefined;
  setType: 'normal' | 'warmup' | 'drop';
};
export type ImportResult = { format: ImportFormat; sets: ImportedSet[]; skipped: number };

const LB_PER_KG = 2.2046226218;

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]!;
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && csv[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((entry) => entry.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += character;
  }
  row.push(cell);
  if (row.some((entry) => entry.trim())) rows.push(row);
  const [headers, ...data] = rows;
  if (!headers) return [];
  const keys = headers.map((header) => header.trim().toLowerCase());
  return data.map((values) =>
    Object.fromEntries(keys.map((key, index) => [key, values[index]?.trim() ?? ''])),
  );
}

export function detectFormat(csv: string): ImportFormat | null {
  const header = (csv.split(/\r?\n/)[0] ?? '').toLowerCase();
  if (header.includes('exercise_title')) return 'hevy';
  if (header.includes('exercise name')) return 'strong';
  if (header.includes('exercise') && (header.includes('category') || header.includes('weight')))
    return 'fitnotes';
  return null;
}

const value = (row: Record<string, string>, ...keys: string[]) => {
  for (const key of keys) if (row[key] !== undefined && row[key] !== '') return row[key]!;
  return '';
};

/** Empty means zero (bodyweight). Anything else must parse as a finite number. */
function parseNumber(text: string): number | null {
  if (!text) return 0;
  const parsed = Number(text.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(text: string): string | null {
  if (!text) return null;
  const normalized = /^\d{4}-\d{2}-\d{2} \d/.test(text) ? text.replace(' ', 'T') : text;
  const date = new Date(normalized);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

/** Two independent 32-bit hashes, so ids are stable across re-imports of the same file. */
function stableHash(text: string) {
  let fnv = 0x811c9dc5;
  let djb = 5381;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    fnv = Math.imul(fnv ^ code, 0x01000193);
    djb = Math.imul(djb, 33) ^ code;
  }
  return (fnv >>> 0).toString(16).padStart(8, '0') + (djb >>> 0).toString(16).padStart(8, '0');
}

function rowUnit(row: Record<string, string>, format: ImportFormat): Unit | null {
  if (format === 'hevy' || row['weight_kg'] !== undefined) return 'kg';
  if (row['weight (kgs)'] !== undefined || row['weight (kg)'] !== undefined) return 'kg';
  const unit = value(row, 'weight unit', 'unit').toLowerCase();
  if (unit.startsWith('kg')) return 'kg';
  if (unit.startsWith('lb')) return 'lb';
  return null;
}

export function importWorkoutCsv(
  csv: string,
  options: { format?: ImportFormat; unit?: Unit } = {},
): ImportResult {
  const format = options.format ?? detectFormat(csv);
  if (!format) throw new Error('Unrecognised CSV. Expected a Strong, Hevy or FitNotes export.');
  const target: Unit = options.unit ?? 'lb';
  const sets: ImportedSet[] = [];
  const seen = new Map<string, number>();
  let skipped = 0;

  for (const row of parseCsv(csv)) {
    const startedAt = parseDate(value(row, 'date', 'start_time', 'start time'));
    const exerciseName = value(row, 'exercise name', 'exercise_title', 'exercise');
    const weightText = value(row, 'weight', 'weight_kg', 'weight (kgs)', 'weight (kg)');
    const weight = parseNumber(weightText);
    const reps = parseNumber(value(row, 'reps', 'rep count'));
    const seconds = parseNumber(value(row, 'seconds', 'duration_seconds'));
    const rpe = parseNumber(value(row, 'rpe'));
    if (
      !startedAt ||
      !exerciseName ||
      weight === null ||
      weight < 0 ||
      reps === null ||
      reps < 0 ||
      seconds === null ||
      seconds < 0 ||
      rpe === null ||
      (reps === 0 && !seconds)
    ) {
      skipped += 1;
      continue;
    }

    const fromUnit = rowUnit(row, format);
    const converted =
      fromUnit && fromUnit !== target
        ? fromUnit === 'kg'
          ? weight * LB_PER_KG
          : weight / LB_PER_KG
        : weight;

    const workoutName =
      format === 'fitnotes'
        ? 'Imported workout'
        : value(row, 'workout name', 'title') || 'Imported workout';
    // FitNotes has no workout grouping, so one day is one workout.
    const workoutKey =
      format === 'fitnotes' ? startedAt.slice(0, 10) : `${startedAt}|${workoutName}`;
    const workoutId = `imp-${stableHash(`${format}|${workoutKey}`)}`;
    const setType = value(row, 'set type', 'set_type').toLowerCase();
    const setSignature = [
      workoutId,
      exerciseName.toLowerCase(),
      Math.round(converted * 10),
      reps,
      seconds ?? 0,
    ].join('|');
    // Identical rows within one file get an occurrence counter so each one is kept.
    const occurrence = seen.get(setSignature) ?? 0;
    seen.set(setSignature, occurrence + 1);

    sets.push({
      id: `imp-${stableHash(`${setSignature}|${occurrence}`)}`,
      workoutId,
      workoutName,
      startedAt,
      exerciseName,
      weight: Math.round(converted * 10) / 10,
      reps,
      seconds: seconds || undefined,
      rir: rpe > 0 ? Math.max(0, 10 - rpe) : undefined,
      setType: setType.includes('warm') ? 'warmup' : setType.includes('drop') ? 'drop' : 'normal',
    });
  }
  return { format, sets, skipped };
}

export function exportAllData(
  tables: Record<string, unknown[]>,
  exportedAt = new Date().toISOString(),
) {
  return JSON.stringify({ schemaVersion: 1, exportedAt, tables }, null, 2);
}
