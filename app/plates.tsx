import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getProfile, updateProfile } from '@/db/repository';
import {
  barOptions,
  plateOptions,
  platesForTarget,
  reverseTarget,
  totalWeight,
} from '@/domain/plates';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function PlatesScreen() {
  const theme = useAppTheme();
  const database = useSQLiteContext();
  const [unit, setUnit] = useState<'lb' | 'kg'>('lb');
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getProfile(database).then((profile) => {
        if (active) setUnit(profile.unit);
      });
      return () => {
        active = false;
      };
    }, [database]),
  );
  const [bar, setBar] = useState(45);
  const [plates, setPlates] = useState<number[]>([]);
  const total = totalWeight(bar, plates);
  const reverse = useMemo(
    () => platesForTarget(reverseTarget[unit], bar, plateOptions[unit]),
    [bar, unit],
  );
  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text>Done</Text>
        </Pressable>
        <Text variant="display">Plates</Text>
      </View>
      <View style={styles.row}>
        {(['lb', 'kg'] as const).map((value) => (
          <Button
            key={value}
            onPress={() => {
              setUnit(value);
              void updateProfile(database, { unit: value });
              setBar(barOptions[value].olympic);
              setPlates([]);
            }}
          >
            {value}
          </Button>
        ))}
      </View>
      <Text variant="number">
        {total} {unit}
      </Text>
      <Text>Per side</Text>
      <View style={styles.plates}>
        {plates.map((plate, index) => (
          <Pressable
            key={`${plate}-${index}`}
            onPress={() =>
              setPlates((items) => items.filter((_, itemIndex) => itemIndex !== index))
            }
            style={[styles.plate, { borderColor: theme.foreground }]}
          >
            <Text>{plate}</Text>
          </Pressable>
        ))}
      </View>
      <Text>Tap to add</Text>
      <View style={styles.row}>
        {plateOptions[unit].map((plate) => (
          <Pressable
            key={plate}
            onPress={() => setPlates((items) => [...items, plate])}
            style={[styles.choice, { backgroundColor: theme.surface }]}
          >
            <Text>{plate}</Text>
          </Pressable>
        ))}
      </View>
      <Text variant="title">Reverse: {reverseTarget[unit]} {unit}</Text>
      <Text>
        {reverse.platesPerSide.length ? reverse.platesPerSide.join(' · ') : 'Bar only'} per side
      </Text>
      <Text>
        {reverse.remainder
          ? `${reverse.remainder} ${unit} cannot be loaded from this inventory`
          : 'Exact load'}
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: { gap: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  plates: { flexDirection: 'row', minHeight: 100, alignItems: 'center', gap: 3 },
  plate: {
    borderWidth: 2,
    borderRadius: radius.sm,
    width: 28,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choice: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
