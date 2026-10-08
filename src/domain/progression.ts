export type Unit = 'lb' | 'kg';

export type CompletedSet = {
  weight: number;
  reps?: number | undefined;
  seconds?: number | undefined;
  rir?: number | undefined;
  completed: boolean;
};

export type WorkoutPerformance = { date: string; sets: CompletedSet[] };

export type ProgressionTarget = {
  weight: number;
  reps: number;
  sets: number;
  reason: string;
  seconds?: number | undefined;
  backoffWeight?: number | undefined;
};

export type BaseInput = {
  weight: number;
  reps: number;
  sets: number;
  increment: number;
  history: WorkoutPerformance[];
  deloadWeek?: boolean | undefined;
};

const round = (value: number, increment: number) => Math.round(value / increment) * increment;
const last = (history: WorkoutPerformance[]) => history.at(-1);
const allHit = (performance: WorkoutPerformance | undefined, reps: number, sets: number) =>
  !!performance &&
  performance.sets.length >= sets &&
  performance.sets.slice(0, sets).every((set) => set.completed && (set.reps ?? 0) >= reps);

export function linearProgression(input: BaseInput): ProgressionTarget {
  if (input.deloadWeek)
    return {
      weight: round(input.weight * 0.9, input.increment),
      reps: input.reps,
      sets: input.sets,
      reason: 'Deload week → -10%',
    };
  if (allHit(last(input.history), input.reps, input.sets))
    return {
      weight: input.weight + input.increment,
      reps: input.reps,
      sets: input.sets,
      reason: `Hit ${input.sets}x${input.reps} last time → +${input.increment}`,
    };
  const recent = input.history.slice(-3);
  if (recent.length === 3 && recent.every((session) => !allHit(session, input.reps, input.sets)))
    return {
      weight: round(input.weight * 0.9, input.increment),
      reps: input.reps,
      sets: input.sets,
      reason: 'Missed target 3 sessions → -10%',
    };
  return {
    weight: input.weight,
    reps: input.reps,
    sets: input.sets,
    reason: 'Target not complete → hold',
  };
}

export function doubleProgression(
  input: BaseInput & { repMin: number; repMax: number },
): ProgressionTarget {
  if (input.deloadWeek)
    return {
      weight: round(input.weight * 0.9, input.increment),
      reps: input.repMin,
      sets: input.sets,
      reason: 'Deload week → reset range at -10%',
    };
  const performance = last(input.history);
  if (allHit(performance, input.repMax, input.sets))
    return {
      weight: input.weight + input.increment,
      reps: input.repMin,
      sets: input.sets,
      reason: `Hit top of range ${input.repMax} → +${input.increment}, reset to ${input.repMin}`,
    };
  // An empty log has no minimum; treat it like no history so the target starts at the bottom.
  const minimum =
    performance && performance.sets.length > 0
      ? Math.min(...performance.sets.slice(0, input.sets).map((set) => set.reps ?? 0))
      : input.repMin - 1;
  const next = Math.min(input.repMax, Math.max(input.repMin, minimum + 1));
  return {
    weight: input.weight,
    reps: next,
    sets: input.sets,
    reason:
      minimum >= input.repMin
        ? `Completed ${minimum} reps → aim for ${next}`
        : `Build from ${input.repMin}`,
  };
}

export function rirProgression(input: BaseInput & { targetRir: number }): ProgressionTarget {
  const completed =
    last(input.history)?.sets.filter((set) => set.completed && set.rir !== undefined) ?? [];
  if (!completed.length)
    return {
      weight: input.weight,
      reps: input.reps,
      sets: input.sets,
      reason: 'No RIR logged → hold',
    };
  const average =
    completed.reduce((sum, set) => sum + (set.rir ?? input.targetRir), 0) / completed.length;
  if (average >= input.targetRir + 1)
    return {
      weight: input.weight + input.increment,
      reps: input.reps,
      sets: input.sets,
      reason: `RIR ${average.toFixed(1)} above target ${input.targetRir} → +${input.increment}`,
    };
  if (average < input.targetRir - 1)
    return {
      weight: Math.max(0, input.weight - input.increment),
      reps: input.reps,
      sets: input.sets,
      reason: `RIR ${average.toFixed(1)} below target ${input.targetRir} → -${input.increment}`,
    };
  return {
    weight: input.weight,
    reps: input.reps,
    sets: input.sets,
    reason: `RIR ${average.toFixed(1)} on target → hold`,
  };
}

export function topSetBackoffs(
  input: BaseInput & { backoffPercent?: number | undefined },
): ProgressionTarget {
  const top = linearProgression({ ...input, sets: 1 });
  const percent = input.backoffPercent ?? 0.1;
  return {
    ...top,
    sets: input.sets,
    backoffWeight: round(top.weight * (1 - percent), input.increment),
    reason: `${top.reason}; back-offs -${Math.round(percent * 100)}%`,
  };
}

const waveReps = [5, 3, 1, 5] as const;
const wavePercent = [0.75, 0.85, 0.95, 0.6] as const;

export function wave531(
  input: Omit<BaseInput, 'history'> & { trainingMax: number; week: 1 | 2 | 3 | 4 },
): ProgressionTarget {
  const index = input.week - 1;
  const reps = waveReps[index]!;
  const percentage = wavePercent[index]!;
  return {
    weight: round(input.trainingMax * percentage, input.increment),
    reps,
    sets: input.week === 4 ? 3 : input.sets,
    reason:
      input.week === 4
        ? 'Wave week 4 deload at 60% training max'
        : `Wave week ${input.week}: ${reps}s at ${Math.round(percentage * 100)}% training max`,
  };
}

export function timeProgression(
  input: BaseInput & { seconds: number; secondsIncrement: number },
): ProgressionTarget {
  const performance = last(input.history);
  const hit =
    !!performance &&
    performance.sets.length >= input.sets &&
    performance.sets
      .slice(0, input.sets)
      .every((set) => set.completed && (set.seconds ?? 0) >= input.seconds);
  return {
    weight: input.weight,
    reps: 0,
    sets: input.sets,
    seconds: hit ? input.seconds + input.secondsIncrement : input.seconds,
    reason: hit
      ? `Held all sets → +${input.secondsIncrement}s`
      : 'Hold target not complete → repeat',
  };
}

export function bodyweightProgression(
  input: Omit<BaseInput, 'weight'> & { repsMax: number; setsMax: number },
): ProgressionTarget {
  const performance = last(input.history);
  if (input.reps < input.repsMax && allHit(performance, input.reps, input.sets))
    return {
      weight: 0,
      reps: input.reps + 1,
      sets: input.sets,
      reason: 'All reps complete → +1 rep',
    };
  if (input.sets < input.setsMax && allHit(performance, input.repsMax, input.sets))
    return {
      weight: 0,
      reps: input.repsMax,
      sets: input.sets + 1,
      reason: 'Rep ceiling complete → +1 set',
    };
  return {
    weight: 0,
    reps: input.reps,
    sets: input.sets,
    reason: 'Bodyweight target incomplete → hold',
  };
}

export type ProgressionPolicy =
  | 'linear'
  | 'double'
  | 'rir'
  | 'top-backoff'
  | '531'
  | 'time'
  | 'bodyweight';

export function defaultPolicy(category: 'compound' | 'accessory' | 'rehab') {
  if (category === 'compound') return { policy: 'linear' as const };
  if (category === 'rehab') return { policy: 'double' as const, repMin: 12, repMax: 20 };
  return { policy: 'double' as const, repMin: 8, repMax: 12 };
}
