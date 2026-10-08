import { StyleSheet, View } from 'react-native';
import { BodyMap } from '@/components/BodyMap';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import {
  calendarHeatmap,
  exerciseHistory,
  muscleVolume,
  personalRecord,
  type HistoryWorkout,
} from '@/domain/history';
import { spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

const sample: HistoryWorkout[] = [
  {
    id: '1',
    date: '2026-09-22',
    sets: [
      {
        exerciseId: 'squat',
        exerciseName: 'Back squat',
        muscle: 'upper legs',
        weight: 175,
        reps: 5,
        done: true,
      },
    ],
  },
  {
    id: '2',
    date: '2026-09-25',
    sets: [
      {
        exerciseId: 'squat',
        exerciseName: 'Back squat',
        muscle: 'upper legs',
        weight: 180,
        reps: 5,
        done: true,
      },
    ],
  },
  {
    id: '3',
    date: '2026-10-01',
    sets: [
      {
        exerciseId: 'squat',
        exerciseName: 'Back squat',
        muscle: 'upper legs',
        weight: 185,
        reps: 5,
        done: true,
      },
    ],
  },
];

export default function History() {
  const theme = useAppTheme();
  const heatmap = calendarHeatmap(sample, new Date().toISOString().slice(0, 10));
  const squat = exerciseHistory(sample, 'squat');
  const pr = personalRecord(squat);
  const volume = muscleVolume(sample);
  return (
    <Screen>
      <Text variant="display">History</Text>
      <Section title="12 weeks">
        <View style={styles.heatmap}>
          {heatmap.map((day) => (
            <View
              key={day.date}
              accessibilityLabel={`${day.date}: ${day.count} workouts`}
              style={[
                styles.day,
                { backgroundColor: day.count ? theme.foreground : theme.surface },
              ]}
            />
          ))}
        </View>
      </Section>
      <Section title="Back squat">
        <Text variant="number">{pr ? `${Math.round(pr.e1rm)} lb e1RM` : 'No sets'}</Text>
        <View style={styles.chart}>
          {squat.map((entry) => (
            <View
              key={entry.date}
              style={[
                styles.bar,
                { height: Math.max(20, entry.e1rm / 2), backgroundColor: theme.foreground },
              ]}
            />
          ))}
        </View>
        {squat.map((entry) => (
          <Text key={entry.date}>
            {entry.date} · {entry.weight} lb × {entry.reps} · e1RM {Math.round(entry.e1rm)}
          </Text>
        ))}
      </Section>
      <Section title="Muscle volume">
        <BodyMap selected="upper legs" />
        <Text>Upper legs · {(volume['upper legs'] ?? 0).toLocaleString()} lb</Text>
      </Section>
      <Section title="Body weight">
        <Text variant="number">182.4 lb</Text>
        <Text>Goal 178 lb</Text>
        <View style={[styles.goal, { borderColor: theme.muted }]}>
          <View style={[styles.progress, { backgroundColor: theme.foreground }]} />
        </View>
      </Section>
      <Section title="Progress photos">
        <Text>
          Add private progress photos from this device. Location metadata is removed before storage.
        </Text>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  day: { width: 13, height: 13 },
  chart: { height: 100, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  bar: { width: 24 },
  goal: { height: 8, borderWidth: 1 },
  progress: { width: '64%', height: '100%' },
});
