import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, TextInput } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Text } from '@/components/Text';
import { exportAllData, importWorkoutCsv, type Unit } from '@/domain/importExport';
import { exportAllTables, saveImport } from '@/db/repository';
import { radius, spacing } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

export default function DataScreen() {
  const database = useSQLiteContext();
  const theme = useAppTheme();
  const [csv, setCsv] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const runImport = async () => {
    setBusy(true);
    try {
      const profile = await database.getFirstAsync<{ unit: Unit }>(
        'SELECT unit FROM profiles LIMIT 1',
      );
      const parsed = importWorkoutCsv(csv, { unit: profile?.unit ?? 'lb' });
      const saved = await saveImport(database, parsed);
      setCsv('');
      setStatus(
        `${parsed.format} import: ${saved.inserted} sets added, ${saved.duplicates} already here, ${saved.skipped} malformed rows skipped.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setBusy(false);
    }
  };

  const runExport = async () => {
    setBusy(true);
    try {
      const tables = await exportAllTables(database);
      const json = exportAllData(tables);
      await Share.share({ title: 'LIFT export', message: json });
      setStatus('Export ready to share.');
    } catch {
      setStatus('Export failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()}>
        <Text>Done</Text>
      </Pressable>
      <Text variant="display">Data</Text>
      <Section title="Import Strong, Hevy, or FitNotes CSV">
        <TextInput
          accessibilityLabel="CSV input"
          value={csv}
          onChangeText={setCsv}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Paste CSV here"
          placeholderTextColor={theme.muted}
          style={[styles.input, { backgroundColor: theme.surface, color: theme.foreground }]}
        />
        <Button disabled={!csv.trim() || busy} onPress={() => void runImport()}>
          Import CSV
        </Button>
        <Text style={{ color: theme.muted }}>
          Importing the same file twice adds nothing new.
        </Text>
      </Section>
      <Section title="Export">
        <Button disabled={busy} onPress={() => void runExport()}>
          Export all data (JSON)
        </Button>
      </Section>
      {status ? <Text>{status}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 160, padding: spacing.md, borderRadius: radius.md, textAlignVertical: 'top' },
});
