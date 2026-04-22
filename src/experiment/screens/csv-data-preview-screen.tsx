import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { parseCsvPreviewRows } from '@/experiment/utils/csvPreview';

export default function CsvDataPreviewScreen() {
  const { url, name } = useLocalSearchParams<{ url: string; name?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const decodedUrl = url ? decodeURIComponent(url) : '';
  const decodedName = name ? decodeURIComponent(name) : 'CSV attachment';
  const [rows, setRows] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!decodedUrl) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        const response = await fetch(decodedUrl);
        const text = await response.text();
        const parsedRows = parseCsvPreviewRows(text, 20);
        if (cancelled) return;
        setRows(parsedRows);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load CSV');
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [decodedUrl]);

  const headers = useMemo(() => rows[0] ?? [], [rows]);
  const bodyRows = useMemo(() => (rows.length > 1 ? rows.slice(1) : []), [rows]);

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title">CSV Data Preview</ThemedText>
      <ThemedText>{decodedName}</ThemedText>
      <ThemedText style={{ color: themeColors.mutedText }}>Showing up to 20 rows.</ThemedText>
      {decodedUrl ? <ThemedText style={{ color: themeColors.mutedText }}>{decodedUrl}</ThemedText> : null}

      {isLoading ? <ThemedText>Loading CSV…</ThemedText> : null}
      {error ? <ThemedText style={{ color: themeColors.danger }}>{error}</ThemedText> : null}
      {!isLoading && !error && rows.length === 0 ? (
        <ThemedText style={{ color: themeColors.mutedText }}>No CSV rows found.</ThemedText>
      ) : null}

      {rows.length > 0 ? (
        <ScrollView horizontal>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {headers.map((cell, cellIndex) => (
                <View
                  key={`header-${cellIndex}`}
                  style={[
                    styles.cell,
                    { borderColor: themeColors.border, backgroundColor: themeColors.heroTint },
                  ]}>
                  <ThemedText type="defaultSemiBold">{cell || `Column ${cellIndex + 1}`}</ThemedText>
                </View>
              ))}
            </View>
            {bodyRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.tableRow}>
                {headers.map((_, cellIndex) => (
                  <View
                    key={`cell-${rowIndex}-${cellIndex}`}
                    style={[
                      styles.cell,
                      { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                    ]}>
                    <ThemedText>{row[cellIndex] ?? ''}</ThemedText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  table: { gap: 0 },
  tableRow: { flexDirection: 'row' },
  cell: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, minWidth: 110 },
});
