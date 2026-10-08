import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import {
  addExerciseToRoutine,
  getProfile,
  loadActivePlan,
  type ActivePlanDay,
} from '@/db/repository';
import {
  deleteCustomExercise,
  getExercise,
  getFavourites,
  toggleFavourite,
  type ExerciseRecord,
} from '@/db/library';
import { exerciseHistory } from '@/db/targets';
import { type Unit } from '@/domain/importExport';
import { type WorkoutPerformance } from '@/domain/progression';
import { spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

const modeLabel = { reps: 'Reps', time: 'Time', cardio: 'Cardio' } as const;

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const database = useSQLiteContext();
  const theme = useAppTheme();
  const [exercise, setExercise] = useState<ExerciseRecord | null>(null);
  const [favourite, setFavourite] = useState(false);
  const [history, setHistory] = useState<WorkoutPerformance[]>([]);
  const [days, setDays] = useState<ActivePlanDay[]>([]);
  const [unit, setUnit] = useState<Unit>('lb');
  const [message, setMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const [record, saved, sessions, plan, profile] = await Promise.all([
          getExercise(database, id),
          getFavourites(database),
          exerciseHistory(database, id),
          loadActivePlan(database),
          getProfile(database),
        ]);
        if (!active) return;
        setExercise(record);
        setFavourite(saved.includes(id));
        setHistory(sessions.slice(-5).reverse());
        setDays(plan.days);
        setUnit(profile.unit);
      })();
      return () => {
        active = false;
      };
    }, [database, id]),
  );

  if (!exercise)
    return (
      <Screen>
        <Text>Exercise not found.</Text>
      </Screen>
    );

  const remove = () =>
    Alert.alert('Delete custom exercise?', 'Past sessions keep its name. Routines drop it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteCustomExercise(database, exercise.id).then(() => router.back());
        },
      },
    ]);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} accessibilityRole="button">
        <Text>Back</Text>
      </Pressable>
      <Text variant="display">{exercise.name}</Text>
      <Text style={{ color: theme.muted }}>
        {modeLabel[exercise.mode]} · {exercise.equipment || 'no equipment'}
        {exercise.custom ? ' · custom' : ''}
      </Text>
      <View style={styles.row}>
        <Button
          onPress={() => {
            void toggleFavourite(database, exercise.id).then((next) =>
              setFavourite(next.includes(exercise.id)),
            );
          }}
        >
          {favourite ? 'Favourited' : 'Favourite'}
        </Button>
        {exercise.custom ? (
          <Button onPress={() => router.push(`/exercise-edit?id=${exercise.id}`)}>Edit</Button>
        ) : null}
        {exercise.custom ? <Button onPress={remove}>Delete</Button> : null}
      </View>

      <Section title="Muscles">
        <Text>Primary: {exercise.primaryMuscles.join(', ') || 'none set'}</Text>
        {exercise.secondaryMuscles.length ? (
          <Text>Secondary: {exercise.secondaryMuscles.join(', ')}</Text>
        ) : null}
      </Section>

      <Section title="How to">
        {exercise.instructions.length ? (
          exercise.instructions.map((step, index) => (
            <Text key={index}>
              {index + 1}. {step}
            </Text>
          ))
        ) : (
          <Text style={{ color: theme.muted }}>No instructions for this exercise.</Text>
        )}
      </Section>

      <Section title="Your history">
        {history.length ? (
          history.map((session) => (
            <View key={session.date + session.sets.length} style={styles.session}>
              <Text variant="label">{formatDate(session.date)}</Text>
              <Text>{session.sets.map((set) => formatSet(set, unit)).join(' · ')}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: theme.muted }}>No logged sets yet.</Text>
        )}
      </Section>

      <Section title="Add to a plan day">
        {days.length ? (
          days.map((day) => (
            <Button
              key={day.routineId}
              onPress={() => {
                void addExerciseToRoutine(
                  database,
                  day.routineId,
                  exercise.id,
                  exercise.mode,
                  unit,
                ).then(() => setMessage(`Added to ${day.name.replace(/^.* · /, '')}.`));
              }}
            >
              {day.name.replace(/^.* · /, '')}
            </Button>
          ))
        ) : (
          <Text style={{ color: theme.muted }}>Start a plan on the Plan tab first.</Text>
        )}
        {message ? <Text>{message}</Text> : null}
      </Section>
    </Screen>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSet(set: WorkoutPerformance['sets'][number], unit: Unit) {
  if (set.seconds !== undefined) return `${set.seconds}s`;
  return set.weight ? `${set.weight} ${unit} × ${set.reps ?? 0}` : `${set.reps ?? 0} reps`;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  session: { gap: 2, paddingVertical: spacing.xs },
});
