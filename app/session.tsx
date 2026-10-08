import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import { finishDraft, getProfile, loadDraft, saveDraft } from '@/db/repository';
import { type Unit } from '@/domain/importExport';
import { sessionVolume } from '@/domain/session';
import { useTrainingStore } from '@/state/training';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function SessionScreen() {
  useKeepAwake();
  const theme = useAppTheme();
  const database = useSQLiteContext();
  const { draft, setDraft, toggleSet, adjustSet, setNotes } = useTrainingStore();
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [rest, setRest] = useState(0);
  const [restTarget, setRestTarget] = useState(0);
  const [unit, setUnit] = useState<Unit>('lb');
  useEffect(() => {
    void getProfile(database).then((profile) => setUnit(profile.unit));
  }, [database]);
  const weightStep = unit === 'kg' ? 2.5 : 5;
  // Load the persisted draft once. Autosave only runs after this, so the load never writes back.
  useEffect(() => {
    void loadDraft(database).then((loaded) => {
      if (!loaded) {
        router.replace('/(tabs)');
        return;
      }
      setDraft(loaded);
      setReady(true);
    });
  }, [database, setDraft]);
  useEffect(() => {
    if (!ready || !draft) return;
    saveDraft(database, draft).then(
      () => setSaveError(''),
      () => setSaveError('Could not save this set. Keep going and check storage.'),
    );
  }, [database, draft, ready]);
  const exercises = useMemo(() => draft?.exercises ?? [], [draft]);
  useEffect(() => {
    if (rest <= 0) return;
    const timer = setTimeout(() => setRest((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [rest]);
  useEffect(() => {
    if (rest === 0 && restTarget > 0)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [rest, restTarget]);
  const completed = useMemo(
    () => exercises.flatMap((exercise) => exercise.sets).filter((set) => set.done).length,
    [exercises],
  );
  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text>Close</Text>
        </Pressable>
        <Text variant="title">{draft?.name ?? 'Session'}</Text>
        <Text variant="number">
          {rest > 0
            ? `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}`
            : `${completed} sets`}
        </Text>
      </View>
      {rest > 0 && (
        <View style={styles.rest}>
          <Text>Rest</Text>
          <View style={styles.row}>
            <Button onPress={() => setRest((value) => Math.max(0, value - 30))}>−30s</Button>
            <Button onPress={() => setRest((value) => value + 30)}>+30s</Button>
            <Button onPress={() => setRest(0)}>Skip</Button>
          </View>
        </View>
      )}
      {exercises.map((exercise) => (
        <View key={exercise.slotId} style={[styles.exercise, { borderTopColor: theme.divider }]}>
          <Text variant="title">{exercise.name}</Text>
          <Text style={{ color: theme.muted }}>{exercise.reason}</Text>
          {exercise.sets.map((workoutSet, index) => (
            <View key={workoutSet.id} style={styles.set}>
              <Text>{index + 1}</Text>
              {exercise.kind === 'time' ? (
                <Stepper
                  value={workoutSet.seconds ?? 0}
                  step={5}
                  suffix="sec"
                  onChange={(delta) => adjustSet(exercise.slotId, workoutSet.id, 'seconds', delta)}
                />
              ) : (
                <>
                  <Stepper
                    value={workoutSet.weight}
                    step={weightStep}
                    suffix={unit}
                    onChange={(delta) => adjustSet(exercise.slotId, workoutSet.id, 'weight', delta)}
                  />
                  <Stepper
                    value={workoutSet.reps}
                    suffix="reps"
                    onChange={(delta) => adjustSet(exercise.slotId, workoutSet.id, 'reps', delta)}
                  />
                </>
              )}
              <Pressable
                accessibilityLabel={`Log set ${index + 1}`}
                onPress={() => {
                  toggleSet(exercise.slotId, workoutSet.id);
                  if (!workoutSet.done) {
                    setRestTarget(exercise.restSeconds);
                    setRest(exercise.restSeconds);
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                }}
                style={[
                  styles.check,
                  { backgroundColor: workoutSet.done ? theme.foreground : theme.surface },
                ]}
              >
                <Text style={{ color: workoutSet.done ? theme.background : theme.foreground }}>
                  ✓
                </Text>
              </Pressable>
            </View>
          ))}
          <View style={styles.rir}>
            <Text>RIR optional</Text>
            {exercise.sets
              .filter((set) => set.done)
              .slice(-1)
              .map((set) => (
                <Stepper
                  key={set.id}
                  value={set.rir ?? 0}
                  onChange={(delta) => adjustSet(exercise.slotId, set.id, 'rir', delta)}
                />
              ))}
          </View>
          {/barbell|squat|deadlift|bench|press/i.test(exercise.name) && (
            <Button onPress={() => router.push('/plates')}>Build plates</Button>
          )}
        </View>
      ))}
      <TextInput
        accessibilityLabel="Session notes"
        value={draft?.notes ?? ''}
        onChangeText={setNotes}
        placeholder="Session notes"
        placeholderTextColor={theme.muted}
        multiline
        style={[styles.notes, { color: theme.foreground, backgroundColor: theme.surface }]}
      />
      <Text>
        Volume {sessionVolume(exercises).toLocaleString()} {unit}
      </Text>
      {saveError ? <Text>{saveError}</Text> : null}
      <Button
        disabled={!draft}
        onPress={() => {
          if (!draft) return;
          void finishDraft(database, draft).then(
            () => {
              setDraft(null);
              router.replace('/(tabs)/history');
            },
            () => setSaveError('Could not finish the session. Your sets are still saved here.'),
          );
        }}
      >
        Finish session
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rest: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  exercise: { paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, gap: spacing.sm },
  set: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  check: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  rir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notes: { minHeight: 88, padding: spacing.md, borderRadius: radius.md, textAlignVertical: 'top' },
});
