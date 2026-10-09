import { Pressable, StyleSheet, View } from 'react-native';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';
import { Text } from './Text';

export function Stepper({
  value,
  step = 1,
  suffix,
  compact = false,
  onChange,
}: {
  value: number;
  step?: number;
  suffix?: string;
  /** Narrower controls for rows that hold two steppers, such as a set's weight and reps. */
  compact?: boolean;
  onChange: (delta: number) => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.root, compact && styles.rootCompact]}>
      <Pressable
        accessibilityLabel={`Decrease ${suffix ?? 'value'}`}
        onPress={() => onChange(-step)}
        style={[
          styles.control,
          compact && styles.controlCompact,
          { backgroundColor: theme.surface },
        ]}
      >
        <Text>−</Text>
      </Pressable>
      <Text variant="number" style={[styles.value, compact && styles.valueCompact]}>
        {value}
        {suffix ? ` ${suffix}` : ''}
      </Text>
      <Pressable
        accessibilityLabel={`Increase ${suffix ?? 'value'}`}
        onPress={() => onChange(step)}
        style={[
          styles.control,
          compact && styles.controlCompact,
          { backgroundColor: theme.surface },
        ]}
      >
        <Text>+</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  control: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 74, textAlign: 'center', fontSize: 18 },
  rootCompact: { gap: 4 },
  controlCompact: { width: 34, height: 40 },
  valueCompact: { minWidth: 52, fontSize: 16 },
});
