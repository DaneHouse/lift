import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@/theme/tokens';
import { Text } from './Text';

export function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.root}>
      <Text variant="label">{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ root: { gap: spacing.sm, marginTop: spacing.md } });
