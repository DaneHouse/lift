import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import { injuriesNeedingCheckin } from '@/db/injuries';
import {
  type ActivePlanDay,
  draftFromRoutine,
  getProfile,
  loadActivePlan,
  loadDraft,
  saveDraft,
} from '@/db/repository';
import { nextRoutine } from '@/domain/plans';
import { useTrainingStore } from '@/state/training';

export default function Today() {
  const database = useSQLiteContext();
  const setDraft = useTrainingStore((state) => state.setDraft);
  const [next, setNext] = useState<ActivePlanDay | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const [plan, draft] = await Promise.all([loadActivePlan(database), loadDraft(database)]);
        const routine = nextRoutine(plan.schedule, new Date(), plan.completedRoutineIds);
        const day = plan.days.find((entry) => entry.routineId === routine?.id) ?? null;
        if (active) {
          setNext(day);
          setInProgress(!!draft);
        }
      })().catch(() => {
        if (active) setError('Could not load your plan.');
      });
      return () => {
        active = false;
      };
    }, [database]),
  );

  const start = async () => {
    if (!next) return;
    try {
      const { unit } = await getProfile(database);
      const draft = await draftFromRoutine(database, next.routineId, next.name, unit);
      if ((await injuriesNeedingCheckin(database, draft)).length > 0) {
        router.push({
          pathname: '/checkin',
          params: { routineId: next.routineId, name: next.name },
        });
        return;
      }
      await saveDraft(database, draft);
      setDraft(draft);
      router.push('/session');
    } catch {
      setError('Could not start the session.');
    }
  };

  const resume = async () => {
    const draft = await loadDraft(database);
    if (!draft) {
      setInProgress(false);
      return;
    }
    setDraft(draft);
    router.push('/session');
  };

  return (
    <Screen>
      <Text variant="display">Today</Text>
      {next ? (
        <>
          <Text variant="title">{next.name}</Text>
          <Text>{next.exerciseCount} exercises</Text>
        </>
      ) : (
        <Section title="No plan yet">
          <Text>Choose a starter template on the Plan tab.</Text>
        </Section>
      )}
      {inProgress ? (
        <Button onPress={() => void resume()}>Resume session</Button>
      ) : (
        <Button disabled={!next} onPress={() => void start()}>
          Start session
        </Button>
      )}
      {error ? <Text>{error}</Text> : null}
    </Screen>
  );
}
