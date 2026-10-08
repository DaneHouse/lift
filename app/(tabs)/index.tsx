import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import { useTrainingStore } from '@/state/training';

export default function Today() {
  const start = useTrainingStore((state) => state.start);
  const exercises = useTrainingStore((state) => state.exercises);
  return (
    <Screen>
      <Text variant="display">Today</Text>
      <Text variant="title">Full Body A</Text>
      <Text>7 exercises · about 60 min</Text>
      <Section title="First target">
        <Text variant="number">185 lb × 5</Text>
        <Text>Hit 3x5 last time → +5 lb</Text>
      </Section>
      <Button
        onPress={() => {
          start();
          router.push('/session');
        }}
      >
        Start session
      </Button>
      <Text>{exercises.map((exercise) => exercise.name).join(' · ')}</Text>
    </Screen>
  );
}
