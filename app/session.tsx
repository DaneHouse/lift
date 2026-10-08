import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
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

const endsIn = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString();

/**
 * Seconds left until the stored end time. Computed from the clock on every render, so a
 * backgrounded app shows the right time as soon as it is foregrounded.
 */
function useRemainingSeconds(endsAt: string | undefined) {
  const [, tick] = useReducer((value: number) => value + 1, 0);
  useEffect(() => {
    if (!endsAt) return;
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [endsAt]);
  if (!endsAt) return 0;
  return Math.max(0, Math.ceil((Date.parse(endsAt) - Date.now()) / 1000));
}

export default function SessionScreen() {
  useKeepAwake();
  const theme = useAppTheme();
  const database = useSQLiteContext();
  const { draft, setDraft, toggleSet, adjustSet, setNotes, setRestEndsAt } = useTrainingStore();
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState('');
  const rest = useRemainingSeconds(draft?.restEndsAt);
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
  // Fire the rest-end haptic only when a running rest reaches zero while this screen is open.
  const previousRest = useRef(rest);
  useEffect(() => {
    if (previousRest.current > 0 && rest === 0)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    previousRest.current = rest;
  }, [rest]);
  /** Moves the stored end time; never before now, so a skipped-past rest just ends. */
  const shiftRest = (seconds: number) => {
    const current = Date.parse(draft?.restEndsAt ?? '') || Date.now();
    const next = Math.max(Date.now(), current + seconds * 1000);
    setRestEndsAt(new Date(next).toISOString());
  };
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
            <Button onPress={() => shiftRest(-30)}>−30s</Button>
            <Button onPress={() => shiftRest(30)}>+30s</Button>
            <Button onPress={() => setRestEndsAt(undefined)}>Skip</Button>
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
                    setRestEndsAt(endsIn(exercise.restSeconds));
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
