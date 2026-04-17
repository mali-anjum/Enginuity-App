import { Link, useLocalSearchParams, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectExperimentById } from '@/experiment/state/experimentSlice';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { useAppSelector } from '@/sharedModules/state/hooks';

export default function ExperimentDetailScreen() {
  const { experimentId } = useLocalSearchParams<{ experimentId: string }>();
  const experiment = useAppSelector(selectExperimentById(experimentId ?? ''));
  const hardwareItems = useAppSelector(selectAllHardware);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  if (!experiment) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Experiment not found.</ThemedText>
      </ThemedView>
    );
  }

  const linkedHardware = hardwareItems.filter((item) => experiment.hardwareIds.includes(item.id));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <ThemedText type="title">{experiment.title}</ThemedText>
          <Link href={`/experiment/${experiment.id}/edit` as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Edit</ThemedText>
          </Link>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Status</ThemedText>
          <ThemedText style={{ color: themeColors.mutedText }}>
            {experiment.status.replace('_', ' ')}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Code Ref</ThemedText>
          <ThemedText>{experiment.codeRef || 'No code reference added.'}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Notes</ThemedText>
          <ThemedText>{experiment.notes || 'No notes added.'}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Hardware</ThemedText>
          {linkedHardware.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No hardware linked.</ThemedText>
          ) : (
            linkedHardware.map((hardware) => (
              <View key={hardware.id} style={[styles.card, { borderColor: themeColors.border }]}>
                <ThemedText type="defaultSemiBold">{hardware.name}</ThemedText>
                <ThemedText style={{ color: themeColors.mutedText }}>{hardware.type}</ThemedText>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Attachments</ThemedText>
          {experiment.attachmentUrls.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No attachments uploaded.</ThemedText>
          ) : (
            experiment.attachmentUrls.map((url) => (
              <View key={url} style={styles.topRow}>
                <Link href={`/experiment/attachment-viewer?url=${encodeURIComponent(url)}` as Href}>
                  <ThemedText style={{ color: themeColors.primary }}>{url}</ThemedText>
                </Link>
                {url.toLowerCase().includes('.csv') ? (
                  <Link href={`/experiment/csv-preview?url=${encodeURIComponent(url)}` as Href}>
                    <ThemedText style={{ color: themeColors.primary }}>Preview CSV</ThemedText>
                  </Link>
                ) : (
                  <Pressable disabled>
                    <ThemedText style={{ color: themeColors.mutedText }}>Image/PDF</ThemedText>
                  </Pressable>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  section: { gap: 8 },
  card: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, gap: 2 },
});
