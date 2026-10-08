import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import {
  deleteCustomExercise,
  getExercise,
  listAllExercises,
  saveCustomExercise,
} from '@/db/library';
import { type ExerciseMode } from '@/domain/exercises';
import { equipmentOptions, primaryMuscleOptions } from '@/domain/library';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

const modes: { value: ExerciseMode; label: string }[] = [
  { value: 'reps', label: 'Reps' },
  { value: 'time', label: 'Time' },
  { value: 'cardio', label: 'Cardio' },
];

export default function ExerciseEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const database = useSQLiteContext();
  const theme = useAppTheme();
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<ExerciseMode>('reps');
  const [primary, setPrimary] = useState<string[]>([]);
  const [secondary, setSecondary] = useState<string[]>([]);
  const [equipment, setEquipment] = useState('body weight');
  const [muscleChoices, setMuscleChoices] = useState<string[]>([]);
  const [equipmentChoices, setEquipmentChoices] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      const all = await listAllExercises(database);
      const existing = id ? await getExercise(database, id) : null;
      if (!active) return;
      setMuscleChoices(primaryMuscleOptions(all));
      setEquipmentChoices(equipmentOptions(all));
      if (existing?.custom) {
        setName(existing.name);
        setMode(existing.mode);
        setPrimary(existing.primaryMuscles);
        setSecondary(existing.secondaryMuscles);
        setEquipment(existing.equipment);
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [database, id]);

  const toggle = (list: string[], value: string, set: (next: string[]) => void) =>
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const equipmentOptionsShown = useMemo(
    () => [...new Set(['body weight', ...equipmentChoices])],
    [equipmentChoices],
  );

  const save = async () => {
    if (!name.trim()) {
      setError('Give the exercise a name.');
      return;
    }
    await saveCustomExercise(
      database,
      { name, mode, primaryMuscles: primary, secondaryMuscles: secondary, equipment },
      id,
    );
    router.back();
  };

  const remove = () => {
    if (!id) return;
    Alert.alert('Delete custom exercise?', 'Past sessions keep its name. Routines drop it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteCustomExercise(database, id).then(() => router.dismissAll());
        },
      },
    ]);
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} accessibilityRole="button">
        <Text>Cancel</Text>
      </Pressable>
      <Text variant="display">{id ? 'Edit exercise' : 'New exercise'}</Text>
      {loaded ? null : <Text style={{ color: theme.muted }}>Loading…</Text>}
      <TextInput
        accessibilityLabel="Exercise name"
        value={name}
        onChangeText={(value) => {
          setName(value);
          setError('');
        }}
        placeholder="Name"
        placeholderTextColor={theme.muted}
        style={[styles.input, { color: theme.foreground, backgroundColor: theme.surface }]}
      />
      {error ? <Text>{error}</Text> : null}

      <Section title="Logged as">
        <View style={styles.wrap}>
          {modes.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={mode === option.value}
              onPress={() => setMode(option.value)}
            />
          ))}
        </View>
      </Section>

      <Section title="Primary muscles">
        <View style={styles.wrap}>
          {muscleChoices.map((muscle) => (
            <Chip
              key={muscle}
              label={muscle}
              active={primary.includes(muscle)}
              onPress={() => toggle(primary, muscle, setPrimary)}
            />
          ))}
        </View>
      </Section>

      <Section title="Secondary muscles">
        <View style={styles.wrap}>
          {muscleChoices.map((muscle) => (
            <Chip
              key={muscle}
              label={muscle}
              active={secondary.includes(muscle)}
              onPress={() => toggle(secondary, muscle, setSecondary)}
            />
          ))}
        </View>
      </Section>

      <Section title="Equipment">
        <View style={styles.wrap}>
          {equipmentOptionsShown.map((choice) => (
            <Chip
              key={choice}
              label={choice}
              active={equipment === choice}
              onPress={() => setEquipment(choice)}
            />
          ))}
        </View>
      </Section>

      <Button onPress={() => void save()}>Save</Button>
      {id ? <Button onPress={remove}>Delete exercise</Button> : null}
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.chip, { backgroundColor: active ? theme.foreground : theme.surface }]}
    >
      <Text variant="label" style={{ color: active ? theme.background : theme.foreground }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  input: { padding: spacing.md, borderRadius: radius.md, fontSize: 16 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
});
