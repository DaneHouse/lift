import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import {
  applyInjuryPlan,
  injuriesNeedingCheckin,
  saveCheckin,
  setInjuryStatus,
} from '@/db/injuries';
import { draftFromRoutine, getProfile, saveDraft, type SessionDraft } from '@/db/repository';
import {
  areaLabel,
  areaShort,
  DISCLAIMER,
  RED_FLAG_QUESTIONS,
  type CheckinInput,
  type Injury,
} from '@/domain/injuries';
import { spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';
import { useTrainingStore } from '@/state/training';

const scores = [1, 2, 3, 4, 5];

export default function CheckinScreen() {
  const { routineId, name } = useLocalSearchParams<{ routineId: string; name: string }>();
  const database = useSQLiteContext();
  const theme = useAppTheme();
  const setDraft = useTrainingStore((state) => state.setDraft);
  const [base, setBase] = useState<SessionDraft | null>(null);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      const { unit } = await getProfile(database);
      const draft = await draftFromRoutine(database, routineId, name, unit);
      const needing = await injuriesNeedingCheckin(database, draft);
      if (!active) return;
      setBase(draft);
      setInjuries(needing);
    })().catch(() => setError('Could not load the check-in.'));
    return () => {
      active = false;
    };
  }, [database, routineId, name]);

  const begin = async (checkins: Record<string, CheckinInput>, record: boolean) => {
    if (!base) return;
    try {
      const { unit } = await getProfile(database);
      if (record)
        for (const injury of injuries) {
          const entry = checkins[injury.id];
          if (!entry) continue;
          await saveCheckin(database, {
            injuryId: injury.id,
            workoutId: base.workoutId,
            score: entry.score,
          });
          if (entry.redFlag) await setInjuryStatus(database, injury.id, 'referred');
        }
      const draft = await applyInjuryPlan(database, base, unit, checkins);
      await saveDraft(database, draft);
      setDraft(draft);
      router.replace('/session');
    } catch {
      setError('Could not start the session.');
    }
  };

  const complete = injuries.every((injury) => answers[injury.id] !== undefined);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} accessibilityRole="button">
        <Text>Cancel</Text>
      </Pressable>
      <Text variant="display">Check-in</Text>
      <Text style={{ color: theme.muted }}>{DISCLAIMER}</Text>
      {base && injuries.length === 0 ? (
        <>
          <Text>Nothing to check today.</Text>
          <Button onPress={() => void begin({}, false)}>Start session</Button>
        </>
      ) : null}
      {injuries.map((injury) => (
        <Section key={injury.id} title={`${areaLabel(injury.area)} · ${injury.side}`}>
          <Text>How does your {areaShort(injury.area)} feel? 1 is bad, 5 is fine.</Text>
          <View style={styles.wrap}>
            {scores.map((score) => (
              <Chip
                key={score}
                label={String(score)}
                active={answers[injury.id] === score}
                onPress={() => setAnswers((current) => ({ ...current, [injury.id]: score }))}
              />
            ))}
          </View>
          <Text variant="label">ANY OF THESE?</Text>
          <Text style={{ color: theme.muted }}>{RED_FLAG_QUESTIONS.join(' · ')}</Text>
          <Chip
            label={flags[injury.id] ? 'Yes, one applies' : 'None apply'}
            active={!!flags[injury.id]}
            onPress={() =>
              setFlags((current) => ({ ...current, [injury.id]: !current[injury.id] }))
            }
          />
          {flags[injury.id] ? (
            <Text>
              LIFT will stop loading this area. See a physio or doctor before training it again.
            </Text>
          ) : null}
        </Section>
      ))}
      {injuries.length > 0 ? (
        <>
          <Button
            disabled={!complete}
            onPress={() =>
              void begin(
                Object.fromEntries(
                  injuries.map((injury) => [
                    injury.id,
                    { score: answers[injury.id] ?? 5, redFlag: !!flags[injury.id] },
                  ]),
                ),
                true,
              )
            }
          >
            Start session
          </Button>
          <Pressable onPress={() => void begin({}, false)} accessibilityRole="button">
            <Text variant="label">Skip check-in</Text>
          </Pressable>
        </>
      ) : null}
      {error ? <Text>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
});
