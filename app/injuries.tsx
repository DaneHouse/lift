import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import {
  addInjury,
  clearReferral,
  deleteInjury,
  listCheckins,
  listInjuries,
  listRehabLogs,
  setInjuryStage,
  setInjuryStatus,
} from '@/db/injuries';
import {
  areaLabel,
  DISCLAIMER,
  injuryAreas,
  RED_FLAG_QUESTIONS,
  rehabMenus,
  stages,
  suggestStageChange,
  type Injury,
  type InjuryArea,
  type InjurySide,
  type InjuryStage,
  type StageSuggestion,
} from '@/domain/injuries';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

const sides: { value: InjurySide; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'both', label: 'Both' },
  { value: 'center', label: 'Centre' },
];

type Entry = { injury: Injury; suggestion: StageSuggestion };

export default function InjuriesScreen() {
  const database = useSQLiteContext();
  const theme = useAppTheme();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [adding, setAdding] = useState(false);
  const [area, setArea] = useState<InjuryArea>('ankle');
  const [side, setSide] = useState<InjurySide>('left');
  const [stage, setStage] = useState<InjuryStage>('protect');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    const injuries = await listInjuries(database);
    const now = new Date();
    setEntries(
      await Promise.all(
        injuries.map(async (injury) => ({
          injury,
          suggestion: suggestStageChange(
            injury,
            await listCheckins(database, injury.id),
            await listRehabLogs(database, injury.id),
            now,
          ),
        })),
      ),
    );
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const act = (work: () => Promise<void>) => void work().then(load);

  const confirmRedFlag = (injury: Injury) =>
    Alert.alert(
      `${areaLabel(injury.area)}: red flags`,
      `${RED_FLAG_QUESTIONS.join('\n')}\n\nIf any of these apply, LIFT stops loading this area and you should see a physio or doctor.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'One applies',
          style: 'destructive',
          onPress: () => act(() => setInjuryStatus(database, injury.id, 'referred')),
        },
      ],
    );

  const confirmDelete = (injury: Injury) =>
    Alert.alert('Delete this injury?', 'Past sessions keep their rehab log.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => act(() => deleteInjury(database, injury.id)),
      },
    ]);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} accessibilityRole="button">
        <Text>Back</Text>
      </Pressable>
      <Text variant="display">Injuries</Text>
      <Text style={{ color: theme.muted }}>{DISCLAIMER}</Text>

      {entries.length === 0 && !adding ? <Text>No injuries logged.</Text> : null}

      {entries.map(({ injury, suggestion }) => (
        <View key={injury.id} style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text variant="title">
            {areaLabel(injury.area)} · {injury.side}
          </Text>
          {injury.description ? <Text>{injury.description}</Text> : null}

          {injury.status === 'referred' ? (
            <>
              <Text>
                Red flag reported. LIFT is not loading this area. See a physio or doctor, then clear
                it here.
              </Text>
              <Button onPress={() => act(() => clearReferral(database, injury.id))}>
                I have had it checked
              </Button>
            </>
          ) : (
            <>
              <Text variant="label">STAGE</Text>
              <View style={styles.wrap}>
                {stages.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    active={injury.stage === option.value}
                    onPress={() => act(() => setInjuryStage(database, injury.id, option.value))}
                  />
                ))}
              </View>
              <Text style={{ color: theme.muted }}>
                {stages.find((option) => option.value === injury.stage)?.hint}
              </Text>
              <Text variant="label">REHAB AT THIS STAGE</Text>
              {rehabMenus[injury.area][injury.stage].map((item) => (
                <Text key={item.name}>
                  {item.name} · {item.sets} × {item.amount}
                  {item.mode === 'time' ? 's' : ''}
                </Text>
              ))}
              {suggestion.action !== 'none' ? (
                <View style={styles.suggestion}>
                  <Text>{suggestion.reason}</Text>
                  {suggestion.action === 'resolve' ? (
                    <Button
                      onPress={() => act(() => setInjuryStatus(database, injury.id, 'resolved'))}
                    >
                      Mark recovered
                    </Button>
                  ) : (
                    <Button
                      onPress={() => act(() => setInjuryStage(database, injury.id, suggestion.to))}
                    >
                      {suggestion.action === 'advance' ? 'Move up to' : 'Move back to'}{' '}
                      {stages.find((option) => option.value === suggestion.to)?.label}
                    </Button>
                  )}
                </View>
              ) : (
                <Text style={{ color: theme.muted }}>{suggestion.reason}</Text>
              )}
              <View style={styles.wrap}>
                <Pressable onPress={() => confirmRedFlag(injury)} accessibilityRole="button">
                  <Text variant="label">Red flags</Text>
                </Pressable>
                <Pressable
                  onPress={() => act(() => setInjuryStatus(database, injury.id, 'resolved'))}
                  accessibilityRole="button"
                >
                  <Text variant="label">Mark recovered</Text>
                </Pressable>
              </View>
            </>
          )}
          <Pressable onPress={() => confirmDelete(injury)} accessibilityRole="button">
            <Text variant="label">Delete</Text>
          </Pressable>
        </View>
      ))}

      {adding ? (
        <>
          <Section title="Body area">
            <View style={styles.wrap}>
              {injuryAreas.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={area === option.value}
                  onPress={() => setArea(option.value)}
                />
              ))}
            </View>
          </Section>
          <Section title="Side">
            <View style={styles.wrap}>
              {sides.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={side === option.value}
                  onPress={() => setSide(option.value)}
                />
              ))}
            </View>
          </Section>
          <Section title="Stage now">
            <View style={styles.wrap}>
              {stages.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={stage === option.value}
                  onPress={() => setStage(option.value)}
                />
              ))}
            </View>
          </Section>
          <TextInput
            accessibilityLabel="What happened"
            value={description}
            onChangeText={setDescription}
            placeholder="What happened"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.foreground, backgroundColor: theme.surface }]}
          />
          <Button
            onPress={() =>
              act(async () => {
                await addInjury(database, { area, side, stage, description });
                setAdding(false);
                setDescription('');
              })
            }
          >
            Save injury
          </Button>
          <Button onPress={() => setAdding(false)}>Cancel</Button>
        </>
      ) : (
        <Button onPress={() => setAdding(true)}>Add injury</Button>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.md, gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
  suggestion: { gap: spacing.sm },
  input: { padding: spacing.md, borderRadius: radius.md, fontSize: 16 },
});
