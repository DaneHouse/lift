import { Pressable, StyleSheet, View } from 'react-native';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';
import { Text } from './Text';

export function Stepper({
  value,
  step = 1,
  suffix,
  onChange,
}: {
  value: number;
  step?: number;
  suffix?: string;
  onChange: (delta: number) => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.root}>
      <Pressable
        accessibilityLabel={`Decrease ${suffix ?? 'value'}`}
        onPress={() => onChange(-step)}
        style={[styles.control, { backgroundColor: theme.surface }]}
      >
        <Text>−</Text>
      </Pressable>
      <Text variant="number" style={styles.value}>
        {value}
        {suffix ? ` ${suffix}` : ''}
      </Text>
      <Pressable
        accessibilityLabel={`Increase ${suffix ?? 'value'}`}
        onPress={() => onChange(step)}
        style={[styles.control, { backgroundColor: theme.surface }]}
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
});
