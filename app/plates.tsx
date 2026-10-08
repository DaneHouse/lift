import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import { getPlateSetup, getProfile, savePlateSetup, updateProfile } from '@/db/repository';
import {
  barTypes,
  barWeightFor,
  defaultPlateSetup,
  plateOptions,
  platesForTarget,
  reverseTarget,
  totalWeight,
  type BarType,
  type PlateSetup,
} from '@/domain/plates';
import { type Unit } from '@/domain/importExport';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

const barLabels: Record<BarType, string> = {
  olympic: 'Olympic',
  ez: 'EZ',
  trap: 'Trap',
  smith: 'Smith',
  custom: 'Custom',
};

export default function PlatesScreen() {
  const theme = useAppTheme();
  const database = useSQLiteContext();
  const [unit, setUnit] = useState<Unit>('lb');
  const [setup, setSetup] = useState<PlateSetup>(defaultPlateSetup('lb'));

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getProfile(database).then(async (profile) => {
        const loaded = await getPlateSetup(database, profile.unit);
        if (!active) return;
        setUnit(profile.unit);
        setSetup(loaded);
      });
      return () => {
        active = false;
      };
    }, [database]),
  );

  /** Every change is written straight to settings, so the setup survives a restart. */
  const update = (change: Partial<PlateSetup>) => {
    const next = { ...setup, ...change };
    setSetup(next);
    void savePlateSetup(database, unit, next);
  };

  const switchUnit = async (value: Unit) => {
    await updateProfile(database, { unit: value });
    setUnit(value);
    setSetup(await getPlateSetup(database, value));
  };

  const barWeight = barWeightFor(unit, setup.bar, setup.barWeight);
  const total = totalWeight(barWeight, setup.stack);
  const reverse = useMemo(
    () => platesForTarget(reverseTarget[unit], barWeight, setup.inventory),
    [barWeight, setup.inventory, unit],
  );
  const owned = (plate: number) => setup.inventory.includes(plate);
  const toggleOwned = (plate: number) =>
    update({
      inventory: owned(plate)
        ? setup.inventory.filter((item) => item !== plate)
        : [...setup.inventory, plate].sort((a, b) => b - a),
    });

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
          <Button key={value} onPress={() => void switchUnit(value)} disabled={value === unit}>
            {value}
          </Button>
        ))}
      </View>
      <Text variant="number">
        {total} {unit}
      </Text>
      <Text>Per side</Text>
      <View style={styles.plates}>
        {setup.stack.map((plate, index) => (
          <Pressable
            key={`${plate}-${index}`}
            accessibilityLabel={`Remove ${plate} plate`}
            onPress={() => update({ stack: setup.stack.filter((_, item) => item !== index) })}
            style={[styles.plate, { borderColor: theme.foreground }]}
          >
            <Text>{plate}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        {setup.inventory.map((plate) => (
          <Pressable
            key={plate}
            accessibilityLabel={`Add ${plate} plate`}
            onPress={() => update({ stack: [...setup.stack, plate] })}
            style={[styles.choice, { backgroundColor: theme.surface }]}
          >
            <Text>{plate}</Text>
          </Pressable>
        ))}
      </View>
      {setup.stack.length ? <Button onPress={() => update({ stack: [] })}>Clear</Button> : null}

      <Text variant="title">Bar</Text>
      <View style={styles.row}>
        {barTypes.map((bar) => (
          <Pressable
            key={bar}
            onPress={() => update({ bar })}
            style={[
              styles.pill,
              { backgroundColor: bar === setup.bar ? theme.foreground : theme.surface },
            ]}
          >
            <Text style={{ color: bar === setup.bar ? theme.background : theme.foreground }}>
              {barLabels[bar]}
            </Text>
          </Pressable>
        ))}
      </View>
      {setup.bar === 'custom' ? (
        <Stepper
          value={setup.barWeight}
          step={unit === 'kg' ? 1 : 5}
          suffix={`${unit} bar`}
          onChange={(delta) => update({ barWeight: Math.max(0, setup.barWeight + delta) })}
        />
      ) : (
        <Text>
          {barWeight} {unit}
        </Text>
      )}

      <Text variant="title">Plates you own</Text>
      <Text>Tap to add or remove. The builder and reverse view only use these.</Text>
      <View style={styles.row}>
        {plateOptions[unit].map((plate) => (
          <Pressable
            key={plate}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: owned(plate) }}
            onPress={() => toggleOwned(plate)}
            style={[
              styles.choice,
              {
                backgroundColor: owned(plate) ? theme.foreground : theme.surface,
              },
            ]}
          >
            <Text style={{ color: owned(plate) ? theme.background : theme.muted }}>{plate}</Text>
          </Pressable>
        ))}
      </View>

      <Text variant="title">
        Reverse: {reverseTarget[unit]} {unit}
      </Text>
      <Text>
        {reverse.platesPerSide.length ? reverse.platesPerSide.join(' · ') : 'Bar only'} per side
      </Text>
      <Text>
        {reverse.remainder
          ? `${reverse.remainder} ${unit} cannot be loaded from the plates you own`
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
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
});
