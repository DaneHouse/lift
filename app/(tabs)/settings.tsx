import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import { getRestDefault, setRestDefault } from '@/db/repository';

export default function Settings() {
  const database = useSQLiteContext();
  const [rest, setRest] = useState(90);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getRestDefault(database).then((value) => {
        if (active) setRest(value);
      });
      return () => {
        active = false;
      };
    }, [database]),
  );
  return (
    <Screen>
      <Text variant="display">Settings</Text>
      <Section title="Rest">
        <Stepper
          value={rest}
          step={15}
          suffix="sec default"
          onChange={(delta) => {
            const next = Math.max(15, rest + delta);
            setRest(next);
            void setRestDefault(database, next);
          }}
        />
        <Text>Used for exercises added without a plan. Each plan day can set its own rest.</Text>
      </Section>
      <Section title="Injuries">
        <Button onPress={() => router.push('/injuries')}>Injuries and rehab</Button>
      </Section>
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
