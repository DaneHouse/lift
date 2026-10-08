import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAppTheme } from '@/theme/useAppTheme';

const tabs = [
  ['index', 'Today', 'today-outline'],
  ['plan', 'Plan', 'list-outline'],
  ['history', 'History', 'bar-chart-outline'],
  ['coach', 'Coach', 'chatbubble-outline'],
  ['settings', 'Settings', 'settings-outline'],
] as const;

export default function TabsLayout() {
  const theme = useAppTheme();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.foreground, tabBarInactiveTintColor: theme.muted, tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.divider } }}>
    {tabs.map(([name, title, icon]) => <Tabs.Screen key={name} name={name} options={{ title, tabBarIcon: ({ color, size }) => <Ionicons name={icon} color={color} size={size} /> }} />)}
  </Tabs>;
}
