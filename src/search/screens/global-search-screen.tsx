import { Link, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllExperiments } from '@/experiment/state/experimentSlice';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { selectAllNotes } from '@/notes/state/notesSlice';
import { selectAllProjects } from '@/project/state/projectSlice';
import { useAppSelector } from '@/sharedModules/state/hooks';

import { AdvancedFilterSheet, type AdvancedFilters } from '../organisms/advanced-filter-sheet';
import {
  aggregateGlobalSearchCounts,
  fetchGlobalSearchEntities,
  type GlobalSearchEntityRow,
} from '../services/globalSearchSupabase';

const INITIAL_FILTERS: AdvancedFilters = {
  dateFrom: '',
  dateTo: '',
  hardwareId: '',
  tag: '',
  status: '',
  projectId: '',
};

export default function GlobalSearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [query, setQuery] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>(INITIAL_FILTERS);
  const [cloudHits, setCloudHits] = useState<GlobalSearchEntityRow[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);

  const projects = useAppSelector(selectAllProjects);
  const experiments = useAppSelector(selectAllExperiments);
  const notes = useAppSelector(selectAllNotes);
  const hardware = useAppSelector(selectAllHardware);

  const quickCount = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { projects: projects.length, experiments: experiments.length, notes: notes.length };
    return {
      projects: projects.filter((item) => item.title.toLowerCase().includes(q)).length,
      experiments: experiments.filter((item) => item.title.toLowerCase().includes(q)).length,
      notes: notes.filter((item) => item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q))
        .length,
    };
  }, [query, projects, experiments, notes]);

  const cloudCounts = useMemo(() => aggregateGlobalSearchCounts(cloudHits), [cloudHits]);
  const cloudTotal = cloudCounts.projects + cloudCounts.experiments + cloudCounts.notes;

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setCloudHits([]);
      setCloudLoading(false);
      return;
    }

    let cancelled = false;
    setCloudLoading(true);
    const timer = setTimeout(() => {
      void (async () => {
        const rows = await fetchGlobalSearchEntities({
          searchQuery: trimmed,
          filterProjectId: filters.projectId || undefined,
          filterStatus: filters.status || undefined,
          filterHardwareId: filters.hardwareId || undefined,
          filterTag: filters.tag || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        });
        if (cancelled) return;
        setCloudHits(rows);
        setCloudLoading(false);
      })();
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    query,
    filters.dateFrom,
    filters.dateTo,
    filters.hardwareId,
    filters.tag,
    filters.status,
    filters.projectId,
  ]);

  const resultsHref =
    `/search/results?query=${encodeURIComponent(query)}` +
    `&status=${encodeURIComponent(filters.status)}` +
    `&projectId=${encodeURIComponent(filters.projectId)}` +
    `&hardwareId=${encodeURIComponent(filters.hardwareId)}` +
    `&tag=${encodeURIComponent(filters.tag)}` +
    `&dateFrom=${encodeURIComponent(filters.dateFrom)}` +
    `&dateTo=${encodeURIComponent(filters.dateTo)}`;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Global Search</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Search across projects, experiments, and notes.
        </ThemedText>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Start typing..."
          placeholderTextColor={themeColors.mutedText}
          style={[styles.searchInput, { borderColor: themeColors.border, color: themeColors.text }]}
        />

        <Pressable
          style={[styles.filterButton, { borderColor: themeColors.border }]}
          onPress={() => setIsFilterSheetOpen(true)}>
          <ThemedText>Open Advanced Filters</ThemedText>
        </Pressable>

        <View style={styles.countGrid}>
          <View style={[styles.countCard, { borderColor: themeColors.border }]}>
            <ThemedText type="defaultSemiBold">Projects</ThemedText>
            <ThemedText>{quickCount.projects}</ThemedText>
          </View>
          <View style={[styles.countCard, { borderColor: themeColors.border }]}>
            <ThemedText type="defaultSemiBold">Experiments</ThemedText>
            <ThemedText>{quickCount.experiments}</ThemedText>
          </View>
          <View style={[styles.countCard, { borderColor: themeColors.border }]}>
            <ThemedText type="defaultSemiBold">Notes</ThemedText>
            <ThemedText>{quickCount.notes}</ThemedText>
          </View>
        </View>

        {query.trim() ? (
          cloudLoading ? (
            <ThemedText style={{ color: themeColors.mutedText }}>Searching cloud index (Supabase FTS)…</ThemedText>
          ) : cloudTotal > 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              Cloud (Supabase FTS): {cloudCounts.projects} projects · {cloudCounts.experiments} experiments ·{' '}
              {cloudCounts.notes} notes
            </ThemedText>
          ) : null
        ) : null}

        <Link href={resultsHref as Href} asChild>
          <Pressable style={[styles.resultsButton, { backgroundColor: themeColors.primary }]}>
            <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
              Open Search Results
            </ThemedText>
          </Pressable>
        </Link>
      </ScrollView>

      <AdvancedFilterSheet
        isOpen={isFilterSheetOpen}
        values={filters}
        hardwareOptions={hardware}
        projectOptions={projects.map((project) => ({ id: project.id, title: project.title }))}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onClose={() => setIsFilterSheetOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  searchInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  filterButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, alignSelf: 'flex-start' },
  countGrid: { gap: 8 },
  countCard: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  resultsButton: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
});
