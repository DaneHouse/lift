import { Text as NativeText, type TextProps } from 'react-native';
import { type } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

type Variant = keyof typeof type;

export function Text({ style, ...props }: TextProps & { variant?: Variant }) {
  const theme = useAppTheme();
  const variant = props.variant ?? 'body';
  const { variant: _variant, ...nativeProps } = props;
  return <NativeText {...nativeProps} style={[type[variant], { color: theme.foreground }, style]} />;
}
