import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';

export default function Settings() {
  return (
    <Screen>
      <Text variant="display">Settings</Text>
      <Section title="About">
        <Text>LIFT 0.1.0</Text>
      </Section>
      <Section title="Your data">
        <Button onPress={() => router.push('/data')}>Import or export</Button>
      </Section>
      <Section title="Acknowledgements">
        <Text>
          Exercise metadata and instructions: hasaneyldrm/exercises-dataset, MIT License. No
          third-party exercise media is included.
        </Text>
      </Section>
    </Screen>
  );
}
