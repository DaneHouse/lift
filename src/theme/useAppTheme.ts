import { useColorScheme } from 'react-native';
import { themeFor } from './tokens';

export function useAppTheme() {
  return themeFor(useColorScheme() === 'dark');
}
