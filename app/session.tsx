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
import { sessionVolume, type SessionExercise } from '@/domain/session';
import { canChangeSlot } from '@/domain/sessionDraft';
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
  const { draft, setDraft, toggleSet, adjustSet, setNotes, setRestEndsAt, moveSlot, setSkipped } =
    useTrainingStore();
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [unit, setUnit] = useState<Unit>('lb');
  const rest = useRemainingSeconds(draft?.restEndsAt);
  const weightStep = unit === 'kg' ? 2.5 : 5;

  useEffect(() => {
    void getProfile(database).then((profile) => setUnit(profile.unit));
  }, [database]);

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

  // Fire the rest-end haptic only when a running rest reaches zero while this screen is open.
  const previousRest = useRef(rest);
  useEffect(() => {
    if (previousRest.current > 0 && rest === 0)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    previousRest.current = rest;
  }, [rest]);

  const exercises = useMemo(() => draft?.exercises ?? [], [draft]);
  const completed = useMemo(
    () => exercises.flatMap((exercise) => exercise.sets).filter((set) => set.done).length,
    [exercises],
  );

  /** Moves the stored end time; never before now, so a rest that has passed simply ends. */
  const shiftRest = (seconds: number) => {
    const current = Date.parse(draft?.restEndsAt ?? '') || Date.now();
    const next = Math.max(Date.now(), current + seconds * 1000);
    setRestEndsAt(new Date(next).toISOString());
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text>Close</Text>
        </Pressable>
        <Text variant="title">{draft?.name ?? 'Session'}</Text>
        <Text variant="number">
          {rest > 0
            ? `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}`
            : `${completed} sets`}
        </Text>
      </View>
      {(draft?.notices ?? []).map((notice) => (
        <Text key={notice}>{notice}</Text>
      ))}
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
      {exercises.map((exercise, position) => (
        <ExerciseCard
          key={exercise.slotId}
          exercise={exercise}
          first={position === 0}
          last={position === exercises.length - 1}
          unit={unit}
          weightStep={weightStep}
          theme={theme}
          onToggle={(setId) => {
            const current = exercise.sets.find((set) => set.id === setId);
            toggleSet(exercise.slotId, setId);
            if (current && !current.done) {
              setRestEndsAt(endsIn(exercise.restSeconds));
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }}
          onAdjust={(setId, field, delta) => adjustSet(exercise.slotId, setId, field, delta)}
          onMove={(direction) => moveSlot(exercise.slotId, direction)}
          onSkip={(skipped) => setSkipped(exercise.slotId, skipped)}
          onSwap={() =>
            router.push({
              pathname: '/library',
              params: { purpose: 'swap', slot: exercise.slotId },
            })
          }
        />
      ))}
      <Button onPress={() => router.push({ pathname: '/library', params: { purpose: 'add' } })}>
        Add exercise
      </Button>
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

function ExerciseCard({
  exercise,
  first,
  last,
  unit,
  weightStep,
  theme,
  onToggle,
  onAdjust,
  onMove,
  onSkip,
  onSwap,
}: {
  exercise: SessionExercise;
  first: boolean;
  last: boolean;
  unit: Unit;
  weightStep: number;
  theme: ReturnType<typeof useAppTheme>;
  onToggle: (setId: string) => void;
  onAdjust: (setId: string, field: 'weight' | 'reps' | 'rir' | 'seconds', delta: number) => void;
  onMove: (direction: -1 | 1) => void;
  onSkip: (skipped: boolean) => void;
  onSwap: () => void;
}) {
  const changeable = canChangeSlot(exercise);
  const timed = exercise.kind === 'time';
  return (
    <View style={[styles.exercise, { borderTopColor: theme.divider }]}>
      <Pressable onPress={() => router.push(`/exercise/${exercise.id}`)} accessibilityRole="link">
        <Text variant="title">{exercise.name}</Text>
      </Pressable>
      <Text style={{ color: theme.muted }}>
        {exercise.skipped ? 'Skipped for today' : exercise.reason}
      </Text>
      <View style={styles.row}>
        {!first && <ActionText label="Up" onPress={() => onMove(-1)} />}
        {!last && <ActionText label="Down" onPress={() => onMove(1)} />}
        {changeable && <ActionText label="Swap" onPress={onSwap} />}
        {changeable && (
          <ActionText
            label={exercise.skipped ? 'Unskip' : 'Skip'}
            onPress={() => onSkip(!exercise.skipped)}
          />
        )}
      </View>
      {!exercise.skipped &&
        exercise.sets.map((workoutSet, index) => (
          <View key={workoutSet.id} style={styles.set}>
            <Text>{index + 1}</Text>
            {timed ? (
              <Stepper
                value={workoutSet.seconds ?? 0}
                step={5}
                suffix="sec"
                onChange={(delta) => onAdjust(workoutSet.id, 'seconds', delta)}
              />
            ) : (
              <>
                <Stepper
                  value={workoutSet.weight}
                  step={weightStep}
                  suffix={unit}
                  onChange={(delta) => onAdjust(workoutSet.id, 'weight', delta)}
                />
                <Stepper
                  value={workoutSet.reps}
                  suffix="reps"
                  onChange={(delta) => onAdjust(workoutSet.id, 'reps', delta)}
                />
              </>
            )}
            <Pressable
              accessibilityLabel={`Log set ${index + 1}`}
              onPress={() => onToggle(workoutSet.id)}
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
      {!exercise.skipped && !timed && (
        <View style={styles.rir}>
          <Text>RIR optional</Text>
          {exercise.sets
            .filter((set) => set.done)
            .slice(-1)
            .map((set) => (
              <Stepper
                key={set.id}
                value={set.rir ?? 0}
                onChange={(delta) => onAdjust(set.id, 'rir', delta)}
              />
            ))}
        </View>
      )}
      {!exercise.skipped && /barbell|squat|deadlift|bench|press/i.test(exercise.name) && (
        <Button onPress={() => router.push('/plates')}>Build plates</Button>
      )}
    </View>
  );
}

function ActionText({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8}>
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rest: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center' },
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
