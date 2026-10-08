import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { type SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import {
  getPlanDay,
  getProfile,
  listRoutineItems,
  removeRoutineItem,
  saveRoutineItem,
  type RoutineItem,
} from '@/db/repository';
import { type Unit } from '@/domain/importExport';
import { describePlan, type ExercisePlan, type ExercisePolicy } from '@/domain/targets';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

const policies: { value: ExercisePolicy; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'double', label: 'Double' },
  { value: 'rir', label: 'RIR' },
  { value: 'top-backoff', label: 'Top set' },
  { value: '531', label: '5/3/1' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'time', label: 'Time' },
];

const policyHelp: Record<ExercisePolicy, string> = {
  linear: 'Add weight when every set is hit. Three misses in a row deload 10%.',
  double: 'Climb reps inside the range, then add weight at the top.',
  rir: 'Weight moves with the reps in reserve you log against the target.',
  'top-backoff': 'One heavy top set, then lighter back-off sets.',
  '531': 'Four-week wave off your training max: 5s, 3s, 1s, deload. Max rises each cycle.',
  bodyweight: 'Add reps up to the ceiling, then add a set.',
  time: 'Hold longer each time every set is held.',
};

export default function PlanDayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const database = useSQLiteContext();
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState<Unit>('lb');
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [day, profile, rows] = await Promise.all([
      getPlanDay(database, id),
      getProfile(database),
      listRoutineItems(database, id),
    ]);
    setTitle(day?.name ?? 'Plan day');
    setUnit(profile.unit);
    setItems(rows);
  }, [database, id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>
      <Text variant="display">{title}</Text>
      <Text>Changes apply to the next session&apos;s targets.</Text>
      {items.map((item) =>
        openId === item.id ? (
          <ItemEditor
            key={item.id}
            item={item}
            unit={unit}
            onCancel={() => setOpenId(null)}
            onSaved={() => {
              setOpenId(null);
              void load();
            }}
            database={database}
          />
        ) : (
          <Pressable key={item.id} onPress={() => setOpenId(item.id)} style={styles.row}>
            <Text variant="title">{item.name}</Text>
            <Text>{describePlan(item.plan, unit, item.restSeconds)}</Text>
          </Pressable>
        ),
      )}
    </Screen>
  );
}

function ItemEditor({
  item,
  unit,
  database,
  onCancel,
  onSaved,
}: {
  item: RoutineItem;
  unit: Unit;
  database: SQLiteDatabase;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const theme = useAppTheme();
  const [plan, setPlan] = useState<ExercisePlan>(item.plan);
  const [rest, setRest] = useState(item.restSeconds);
  const timed = plan.policy === 'time';
  const wave = plan.policy === '531';
  const bodyweight = plan.policy === 'bodyweight';
  const weightStep = unit === 'kg' ? 2.5 : 5;
  const patch = (change: Partial<ExercisePlan>) =>
    setPlan((current) => ({ ...current, ...change }));

  return (
    <View style={[styles.editor, { backgroundColor: theme.surface }]}>
      <Text variant="title">{item.name}</Text>
      <View style={styles.row}>
        {policies.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => patch({ policy: option.value })}
            style={[
              styles.choice,
              {
                backgroundColor: option.value === plan.policy ? theme.foreground : theme.background,
              },
            ]}
          >
            <Text
              style={{ color: option.value === plan.policy ? theme.background : theme.foreground }}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text>{policyHelp[plan.policy]}</Text>
      <Stepper
        value={plan.sets}
        suffix="sets"
        onChange={(delta) => patch({ sets: Math.max(1, plan.sets + delta) })}
      />
      {timed ? (
        <Stepper
          value={plan.seconds}
          step={5}
          suffix="sec hold"
          onChange={(delta) => patch({ seconds: Math.max(5, plan.seconds + delta) })}
        />
      ) : wave ? (
        <Stepper
          value={plan.trainingMax}
          step={weightStep}
          suffix={`${unit} training max`}
          onChange={(delta) => patch({ trainingMax: Math.max(0, plan.trainingMax + delta) })}
        />
      ) : (
        <>
          <Stepper
            value={plan.repMin}
            suffix={bodyweight ? 'starting reps' : 'min reps'}
            onChange={(delta) =>
              patch({
                repMin: Math.max(1, plan.repMin + delta),
                repMax: Math.max(plan.repMax, plan.repMin + delta),
              })
            }
          />
          <Stepper
            value={plan.repMax}
            suffix={bodyweight ? 'rep ceiling' : 'max reps'}
            onChange={(delta) => patch({ repMax: Math.max(plan.repMin, plan.repMax + delta) })}
          />
        </>
      )}
      {plan.policy === 'rir' && (
        <Stepper
          value={plan.targetRir}
          suffix="target RIR"
          onChange={(delta) =>
            patch({ targetRir: Math.min(5, Math.max(0, plan.targetRir + delta)) })
          }
        />
      )}
      {plan.policy === 'top-backoff' && (
        <Stepper
          value={Math.round(plan.backoffPercent * 100)}
          step={5}
          suffix="% back-off"
          onChange={(delta) =>
            patch({
              backoffPercent: Math.min(0.3, Math.max(0.05, plan.backoffPercent + delta / 100)),
            })
          }
        />
      )}
      {!bodyweight && (
        <Stepper
          value={plan.increment}
          step={timed ? 5 : weightStep}
          suffix={timed ? 'sec per hit' : `${unit} per hit`}
          onChange={(delta) => patch({ increment: Math.max(0, plan.increment + delta) })}
        />
      )}
      {!timed && !wave && (
        <Stepper
          value={plan.deloadEvery}
          suffix="deload every N weeks (0 = off)"
          onChange={(delta) => patch({ deloadEvery: Math.max(0, plan.deloadEvery + delta) })}
        />
      )}
      <Stepper
        value={rest}
        step={15}
        suffix="sec rest"
        onChange={(delta) => setRest(Math.max(0, rest + delta))}
      />
      <View style={styles.row}>
        <Button
          onPress={() => {
            void saveRoutineItem(database, item.id, plan, rest).then(onSaved);
          }}
        >
          Save
        </Button>
        <Button onPress={onCancel}>Cancel</Button>
        <Button
          onPress={() => {
            void removeRoutineItem(database, item.id).then(onSaved);
          }}
        >
          Remove
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingVertical: spacing.sm },
  choice: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  editor: { padding: spacing.md, borderRadius: radius.md, gap: spacing.sm },
});
