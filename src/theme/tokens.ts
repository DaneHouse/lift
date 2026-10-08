import type { TextStyle } from 'react-native';

export const palette = {
  black: '#000000',
  white: '#FFFFFF',
  gray100: '#F4F4F4',
  gray300: '#C7C7C7',
  gray600: '#6B6B6B',
  gray850: '#242424',
  success: '#4C9A61',
  warning: '#C58A28',
  danger: '#C75252',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 6, md: 10, pill: 999 } as const;
export const type: Record<'display' | 'title' | 'body' | 'label' | 'number', TextStyle> = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  number: { fontSize: 24, lineHeight: 30, fontWeight: '600', fontVariant: ['tabular-nums'] },
};

export function themeFor(dark: boolean) {
  return {
    background: dark ? palette.black : palette.white,
    foreground: dark ? palette.white : palette.black,
    muted: dark ? palette.gray300 : palette.gray600,
    surface: dark ? palette.gray850 : palette.gray100,
    divider: dark ? '#333333' : '#DDDDDD',
  };
}
