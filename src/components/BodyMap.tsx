import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';
import { Text } from './Text';

export type BodyRegion = 'shoulders' | 'chest' | 'back' | 'arms' | 'core' | 'glutes' | 'upper legs' | 'lower legs';

type Props = { selected?: BodyRegion | undefined; onSelect?: ((region: BodyRegion) => void) | undefined };

const regions: { region: BodyRegion; path: string }[] = [
  { region: 'shoulders', path: 'M28 35 Q50 24 72 35 L67 48 L33 48 Z' },
  { region: 'chest', path: 'M35 46 L65 46 L62 70 L38 70 Z' },
  { region: 'core', path: 'M39 70 L61 70 L59 101 L41 101 Z' },
  { region: 'arms', path: 'M28 39 L35 48 L27 91 L18 88 Z M72 39 L82 88 L73 91 L65 48 Z' },
  { region: 'upper legs', path: 'M41 100 L50 103 L47 148 L34 148 Z M50 103 L59 100 L66 148 L53 148 Z' },
  { region: 'lower legs', path: 'M34 148 L47 148 L44 190 L32 190 Z M53 148 L66 148 L68 190 L56 190 Z' },
];

function Figure({ selected, onSelect, back = false }: Props & { back?: boolean }) {
  const theme = useAppTheme();
  return <Pressable accessibilityLabel={back ? 'Back body map' : 'Front body map'}>
    <Svg width={120} height={220} viewBox="0 0 100 210">
      <Circle cx="50" cy="16" r="12" fill={theme.surface} />
      <Rect x="45" y="27" width="10" height="10" fill={theme.surface} />
      {regions.map(({ region, path }) => {
        const mapped = back && region === 'chest' ? 'back' : back && region === 'core' ? 'glutes' : region;
        return <Path key={region} d={path} fill={selected === mapped ? theme.foreground : theme.surface} stroke={theme.background} strokeWidth={1.5} onPress={() => onSelect?.(mapped)} />;
      })}
    </Svg>
  </Pressable>;
}

export function BodyMap({ selected, onSelect }: Props) {
  return <View style={styles.root}><View><Text variant="label">FRONT</Text><Figure selected={selected} onSelect={onSelect} /></View><View><Text variant="label">BACK</Text><Figure selected={selected} onSelect={onSelect} back /></View></View>;
}

const styles = StyleSheet.create({ root: { flexDirection: 'row', justifyContent: 'space-around', gap: spacing.md } });
