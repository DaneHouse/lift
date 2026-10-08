import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';
import { Text } from './Text';

type Props = PropsWithChildren<Omit<PressableProps, 'children'>>;

export function Button({ children, disabled, style, ...props }: Props) {
  const theme = useAppTheme();
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={(state) => [
        styles.root,
        { backgroundColor: theme.foreground, opacity: disabled || state.pressed ? 0.55 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text variant="label" style={{ color: theme.background }}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
