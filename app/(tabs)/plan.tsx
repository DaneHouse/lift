import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import { getProfile, loadActivePlan, saveActivePlan, updateProfile } from '@/db/repository';
import { fitSessionLength, starterTemplates } from '@/domain/plans';
import { spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

type Minutes = 45 | 60 | 75 | 90;

export default function Plan() {
  const theme = useAppTheme();
  const database = useSQLiteContext();
  const [minutes, setMinutes] = useState<Minutes>(60);
  const [templateId, setTemplateId] = useState(starterTemplates[0]!.id);
  const [activeName, setActiveName] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const template = starterTemplates.find((item) => item.id === templateId) ?? starterTemplates[0]!;
  const day = fitSessionLength(template.days[0]!, minutes);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void Promise.all([getProfile(database), loadActivePlan(database)]).then(
        ([profile, plan]) => {
          if (!active) return;
          setMinutes(profile.sessionMinutes);
          setActiveName(plan.days[0]?.name.replace(/ · Day \d+$/, '') ?? null);
        },
      );
      return () => {
        active = false;
      };
    }, [database]),
  );

  const choose = (value: Minutes) => {
    setMinutes(value);
    void updateProfile(database, { sessionMinutes: value });
  };

  const savePlan = async () => {
    try {
      await saveActivePlan(database, template, minutes);
      setActiveName(template.name);
      setStatus(`${template.name} is now your plan.`);
    } catch {
      setStatus('Could not save the plan.');
    }
  };

  return (
    <Screen>
      <Text variant="display">Plan</Text>
      {activeName ? <Text>Active: {activeName}</Text> : <Text>No active plan.</Text>}
      <Section title="Session length">
        <View style={styles.row}>
          {([45, 60, 75, 90] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => choose(value)}
              style={[
                styles.choice,
                { backgroundColor: value === minutes ? theme.foreground : theme.surface },
              ]}
            >
              <Text style={{ color: value === minutes ? theme.background : theme.foreground }}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>
      <Section title="Starter templates">
        {starterTemplates.map((item) => (
          <Pressable key={item.id} onPress={() => setTemplateId(item.id)}>
            <Text variant={item.id === templateId ? 'title' : 'body'}>{item.name}</Text>
          </Pressable>
        ))}
      </Section>
      <Section title="Day 1">
        {day.map((exercise) => (
          <Text key={exercise.name}>
            {exercise.sets} × {exercise.repMin}
            {exercise.repMax !== exercise.repMin ? `–${exercise.repMax}` : ''} · {exercise.name}
          </Text>
        ))}
      </Section>
      <Button onPress={() => void savePlan()}>Use this plan</Button>
      {status ? <Text>{status}</Text> : null}
      <Text>Schedule by weekday or use rotation to run the next undone session.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  choice: { padding: spacing.sm, minWidth: 48, alignItems: 'center' },
});
