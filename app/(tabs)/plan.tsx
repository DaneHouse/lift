import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import { fitSessionLength, starterTemplates } from '@/domain/plans';
import { spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function Plan() {
  const theme = useAppTheme();
  const [minutes, setMinutes] = useState<45 | 60 | 75 | 90>(60);
  const [templateId, setTemplateId] = useState('full-3');
  const template = starterTemplates.find((item) => item.id === templateId) ?? starterTemplates[0]!;
  const day = fitSessionLength(template.days[0]!, minutes);
  return (
    <Screen>
      <Text variant="display">Plan</Text>
      <Section title="Session length">
        <View style={styles.row}>
          {([45, 60, 75, 90] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setMinutes(value)}
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
      <Text>Schedule by weekday or use rotation to run the next undone session.</Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  choice: { padding: spacing.sm, minWidth: 48, alignItems: 'center' },
});
