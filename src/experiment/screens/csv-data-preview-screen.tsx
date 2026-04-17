import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

const SAMPLE_ROWS = [
  ['time_s', 'voltage_v', 'current_a'],
  ['0', '3.31', '0.25'],
  ['1', '3.28', '0.26'],
  ['2', '3.27', '0.27'],
  ['3', '3.25', '0.27'],
];

export default function CsvDataPreviewScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const decodedUrl = url ? decodeURIComponent(url) : '';

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title">CSV Data Preview</ThemedText>
      <ThemedText style={{ color: themeColors.mutedText }}>
        Basic table/chart preview placeholder for CSV attachments.
      </ThemedText>
      <ThemedText>{decodedUrl || 'No CSV URL provided.'}</ThemedText>

      <ScrollView horizontal>
        <View style={styles.table}>
          {SAMPLE_ROWS.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.tableRow}>
              {row.map((cell, cellIndex) => (
                <View
                  key={`cell-${rowIndex}-${cellIndex}`}
                  style={[
                    styles.cell,
                    { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                  ]}>
                  <ThemedText>{cell}</ThemedText>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  table: { gap: 0 },
  tableRow: { flexDirection: 'row' },
  cell: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, minWidth: 110 },
});
