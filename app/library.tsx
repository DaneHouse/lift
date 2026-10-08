import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { BodyMap } from '@/components/BodyMap';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  getFavourites,
  listAllExercises,
  toggleFavourite,
  type ExerciseRecord,
} from '@/db/library';
import { filterBrowsable, equipmentOptions, type BodyRegion } from '@/domain/library';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function LibraryScreen() {
  const theme = useAppTheme();
  const database = useSQLiteContext();
  const [items, setItems] = useState<ExerciseRecord[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<BodyRegion | undefined>();
  const [equipment, setEquipment] = useState<string | undefined>();
  const [favouritesOnly, setFavouritesOnly] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void Promise.all([listAllExercises(database), getFavourites(database)]).then(
        ([all, saved]) => {
          if (!active) return;
          setItems(all);
          setFavourites(saved);
        },
      );
      return () => {
        active = false;
      };
    }, [database]),
  );

  const favouriteSet = useMemo(() => new Set(favourites), [favourites]);
  const equipmentChoices = useMemo(() => equipmentOptions(items), [items]);
  const visible = useMemo(
    () =>
      filterBrowsable(items, {
        query,
        region,
        equipment,
        favouritesOnly,
        favourites: favouriteSet,
      }),
    [items, query, region, equipment, favouritesOnly, favouriteSet],
  );

  const onStar = async (id: string) => {
    setFavourites(await toggleFavourite(database, id));
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        initialNumToRender={25}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Pressable onPress={() => router.back()} accessibilityRole="button">
                <Text>Back</Text>
              </Pressable>
              <Button onPress={() => router.push('/exercise-edit')}>New custom</Button>
            </View>
            <Text variant="display">Library</Text>
            <TextInput
              accessibilityLabel="Search exercises"
              value={query}
              onChangeText={setQuery}
              placeholder="Search exercises"
              placeholderTextColor={theme.muted}
              autoCorrect={false}
              style={[styles.search, { color: theme.foreground, backgroundColor: theme.surface }]}
            />
            <BodyMap
              selected={region}
              onSelect={(next) => setRegion(next === region ? undefined : next)}
            />
            <Text>
              {region
                ? `Muscle: ${region}. Tap it again to clear.`
                : 'Tap the body to filter by muscle.'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chips}>
                <Chip
                  label="Favourites"
                  active={favouritesOnly}
                  onPress={() => setFavouritesOnly((value) => !value)}
                />
                <Chip
                  label="Any equipment"
                  active={!equipment}
                  onPress={() => setEquipment(undefined)}
                />
                {equipmentChoices.map((choice) => (
                  <Chip
                    key={choice}
                    label={choice}
                    active={equipment === choice}
                    onPress={() => setEquipment(equipment === choice ? undefined : choice)}
                  />
                ))}
              </View>
            </ScrollView>
            <Text>{visible.length} exercises</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/exercise/${item.id}`)}
            accessibilityRole="button"
            style={[styles.row, { borderBottomColor: theme.divider }]}
          >
            <View style={styles.rowText}>
              <Text variant="title" numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={{ color: theme.muted }} numberOfLines={1}>
                {[item.primaryMuscles.join(', '), item.equipment, item.custom ? 'custom' : '']
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
            <Pressable
              onPress={() => void onStar(item.id)}
              accessibilityRole="button"
              accessibilityLabel={favouriteSet.has(item.id) ? 'Remove favourite' : 'Add favourite'}
              hitSlop={12}
            >
              <Ionicons
                name={favouriteSet.has(item.id) ? 'star' : 'star-outline'}
                size={22}
                color={theme.foreground}
              />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: theme.muted }}>
            No exercises match these filters. Clear a filter or create a custom exercise.
          </Text>
        }
      />
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.chip, { backgroundColor: active ? theme.foreground : theme.surface }]}
    >
      <Text variant="label" style={{ color: active ? theme.background : theme.foreground }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0, paddingBottom: spacing.xxl },
  header: { gap: spacing.md, paddingBottom: spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  search: { padding: spacing.md, borderRadius: radius.md, fontSize: 16 },
  chips: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { flex: 1, gap: 2 },
});
