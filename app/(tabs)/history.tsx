import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { BodyMap, type BodyRegion } from '@/components/BodyMap';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import {
  addBodyweight,
  type BodyweightEntry,
  getProfile,
  getSetting,
  listBodyweight,
  listCompletedWorkouts,
  setSetting,
  type Profile,
} from '@/db/repository';
import {
  calendarHeatmap,
  exerciseHistory,
  localDayKey,
  muscleVolume,
  personalRecord,
  type HistoryWorkout,
} from '@/domain/history';
import { spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

type Loaded = {
  workouts: HistoryWorkout[];
  bodyweight: BodyweightEntry[];
  goal: number | null;
  profile: Profile;
};

export default function History() {
  const theme = useAppTheme();
  const database = useSQLiteContext();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    const [workouts, bodyweight, goal, profile] = await Promise.all([
      listCompletedWorkouts(database),
      listBodyweight(database),
      getSetting<number>(database, 'bodyweightGoal'),
      getProfile(database),
    ]);
    setLoaded({ workouts, bodyweight, goal, profile });
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void load().catch(() => setStatus('Could not load history.'));
    }, [load]),
  );

  const workouts = useMemo(() => loaded?.workouts ?? [], [loaded]);
  const heatmap = useMemo(
    () => calendarHeatmap(workouts, localDayKey(new Date())),
    [workouts],
  );
  const volume = useMemo(() => muscleVolume(workouts), [workouts]);
  const topMuscle = Object.entries(volume).sort((a, b) => b[1] - a[1])[0]?.[0] as
    | BodyRegion
    | undefined;
  const exerciseCounts = useMemo(() => {
    const counts = new Map<string, { name: string; sets: number }>();
    for (const set of workouts.flatMap((workout) => workout.sets)) {
      const entry = counts.get(set.exerciseId) ?? { name: set.exerciseName, sets: 0 };
      entry.sets += 1;
      counts.set(set.exerciseId, entry);
    }
    return [...counts.entries()].sort((a, b) => b[1].sets - a[1].sets).slice(0, 6);
  }, [workouts]);
  const selectedId = exerciseId ?? exerciseCounts[0]?.[0] ?? null;
  const squat = selectedId ? exerciseHistory(workouts, selectedId) : [];
  const pr = personalRecord(squat);
  const latest = loaded?.bodyweight.at(-1);
  const unit = loaded?.profile.unit ?? 'lb';

  const addEntry = async () => {
    const weight = Number(weightInput);
    if (!Number.isFinite(weight) || weight <= 0) {
      setStatus('Enter a body weight above zero.');
      return;
    }
    await addBodyweight(database, weight, unit);
    setWeightInput('');
    setStatus('Saved.');
    await load();
  };

  const saveGoal = async () => {
    const goal = Number(goalInput);
    if (!Number.isFinite(goal) || goal <= 0) {
      setStatus('Enter a goal above zero.');
      return;
    }
    await setSetting(database, 'bodyweightGoal', goal);
    setGoalInput('');
    setStatus('Goal saved.');
    await load();
  };

  return (
    <Screen>
      <Text variant="display">History</Text>
      {status ? <Text>{status}</Text> : null}
      <Section title="12 weeks">
        {workouts.length === 0 ? (
          <Text style={{ color: theme.muted }}>No completed workouts yet.</Text>
        ) : null}
        <View style={styles.heatmap}>
          {heatmap.map((day) => (
            <View
              key={day.date}
              accessibilityLabel={`${day.date}: ${day.count} workouts`}
              style={[
                styles.day,
                { backgroundColor: day.count ? theme.foreground : theme.surface },
              ]}
            />
          ))}
        </View>
      </Section>
      <Section title="Exercise">
        <View style={styles.chips}>
          {exerciseCounts.map(([id, entry]) => (
            <Pressable
              key={id}
              onPress={() => setExerciseId(id)}
              style={[
                styles.chip,
                { backgroundColor: id === selectedId ? theme.foreground : theme.surface },
              ]}
            >
              <Text style={{ color: id === selectedId ? theme.background : theme.foreground }}>
                {entry.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text variant="number">{pr ? `${Math.round(pr.e1rm)} ${unit} e1RM` : 'No sets'}</Text>
        <View style={styles.chart}>
          {squat.map((entry) => (
            <View
              key={`${entry.date}-${entry.weight}-${entry.reps}`}
              style={[
                styles.bar,
                { height: Math.max(20, entry.e1rm / 2), backgroundColor: theme.foreground },
              ]}
            />
          ))}
        </View>
        {squat.map((entry) => (
          <Text key={`${entry.date}-${entry.weight}-${entry.reps}`}>
            {entry.date.slice(0, 10)} · {entry.weight} {unit} × {entry.reps} · e1RM{' '}
            {Math.round(entry.e1rm)}
          </Text>
        ))}
      </Section>
      <Section title="Muscle volume">
        <BodyMap selected={topMuscle} />
        {topMuscle ? (
          <Text>
            {topMuscle} · {(volume[topMuscle] ?? 0).toLocaleString()} {unit}
          </Text>
        ) : (
          <Text style={{ color: theme.muted }}>No volume yet.</Text>
        )}
      </Section>
      <Section title="Body weight">
        <Text variant="number">{latest ? `${latest.weight} ${latest.unit}` : 'No entries'}</Text>
        <Text>{loaded?.goal ? `Goal ${loaded.goal} ${unit}` : 'No goal set'}</Text>
        <View style={styles.row}>
          <TextInput
            accessibilityLabel="Body weight"
            keyboardType="decimal-pad"
            value={weightInput}
            onChangeText={setWeightInput}
            placeholder={`Weight (${unit})`}
            placeholderTextColor={theme.muted}
            style={[styles.field, { backgroundColor: theme.surface, color: theme.foreground }]}
          />
          <Button disabled={!weightInput} onPress={() => void addEntry()}>
            Add
          </Button>
        </View>
        <View style={styles.row}>
          <TextInput
            accessibilityLabel="Goal body weight"
            keyboardType="decimal-pad"
            value={goalInput}
            onChangeText={setGoalInput}
            placeholder={`Goal (${unit})`}
            placeholderTextColor={theme.muted}
            style={[styles.field, { backgroundColor: theme.surface, color: theme.foreground }]}
          />
          <Button disabled={!goalInput} onPress={() => void saveGoal()}>
            Set goal
          </Button>
        </View>
      </Section>
      <Section title="Progress photos">
        <Text>Progress photos are not available yet.</Text>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  day: { width: 13, height: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  chart: { height: 100, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  bar: { width: 24 },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  field: { flex: 1, padding: spacing.sm, borderRadius: 8 },
});
