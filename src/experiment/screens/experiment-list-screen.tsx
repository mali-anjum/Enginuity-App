import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import {
  selectAllExperiments,
  setExperimentStatusFilter,
} from '@/experiment/state/experimentSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const STATUS_FILTERS = ['draft', 'in_progress', 'completed'] as const;

export default function ExperimentListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const experiments = useAppSelector(selectAllExperiments);
  const activeStatus = useAppSelector((state) => state.experiment.filterByStatus);

  const filtered = activeStatus
    ? experiments.filter((experiment) => experiment.status === activeStatus)
    : experiments;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Experiment List</ThemedText>
          <Link href={'/experiment/create' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Create Experiment</ThemedText>
          </Link>
        </View>

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => dispatch(setExperimentStatusFilter(null))}
            style={[
              styles.filterChip,
              {
                borderColor: activeStatus === null ? themeColors.primary : themeColors.border,
                backgroundColor: activeStatus === null ? themeColors.heroTint : themeColors.background,
              },
            ]}>
            <ThemedText>all</ThemedText>
          </Pressable>
          {STATUS_FILTERS.map((status) => {
            const active = activeStatus === status;
            return (
              <Pressable
                key={status}
                onPress={() => dispatch(setExperimentStatusFilter(status))}
                style={[
                  styles.filterChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{status.replace('_', ' ')}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              No experiments in this view.
            </ThemedText>
          ) : (
            filtered.map((experiment) => (
              <Link key={experiment.id} href={`/experiment/${experiment.id}` as Href} asChild>
                <Pressable
                  style={[
                    styles.card,
                    { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                  ]}>
                  <ThemedText type="defaultSemiBold">{experiment.title}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>
                    {experiment.status.replace('_', ' ')}
                  </ThemedText>
                </Pressable>
              </Link>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  list: { gap: 10 },
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 4 },
});
