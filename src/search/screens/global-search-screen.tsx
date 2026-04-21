import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { selectAllTags } from '@/notes/state/notesSlice';
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
  tagNames: [],
  status: '',
  projectId: '',
};

type SearchTab = 'experiments' | 'notes' | 'hardware';

function HighlightedText({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <ThemedText>{text}</ThemedText>;
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index < 0) return <ThemedText>{text}</ThemedText>;
  const start = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const end = text.slice(index + q.length);
  return (
    <ThemedText>
      {start}
      <Text style={{ fontWeight: '700' }}>{match}</Text>
      {end}
    </ThemedText>
  );
}

export default function GlobalSearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [query, setQuery] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>(INITIAL_FILTERS);
  const [cloudHits, setCloudHits] = useState<GlobalSearchEntityRow[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('experiments');

  const projects = useAppSelector(selectAllProjects);
  const hardware = useAppSelector(selectAllHardware);
  const tagOptions = useAppSelector(selectAllTags);

  const cloudCounts = useMemo(() => aggregateGlobalSearchCounts(cloudHits), [cloudHits]);
  const experimentHits = useMemo(
    () => cloudHits.filter((row) => row.entity_type === 'experiment'),
    [cloudHits],
  );
  const noteHits = useMemo(
    () => cloudHits.filter((row) => row.entity_type === 'note'),
    [cloudHits],
  );
  const hardwareHits = useMemo(
    () => cloudHits.filter((row) => row.entity_type === 'hardware'),
    [cloudHits],
  );

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
          filterTags: filters.tagNames,
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
    filters.tagNames,
    filters.status,
    filters.projectId,
  ]);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Global Search</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Search across experiment titles/observations, notes, and hardware names.
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

        {query.trim() ? (
          cloudLoading ? (
            <ThemedText style={{ color: themeColors.mutedText }}>Searching cloud index (Supabase FTS)…</ThemedText>
          ) : cloudHits.length > 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              Cloud (Supabase FTS): {cloudCounts.experiments} experiments · {cloudCounts.notes} notes ·{' '}
              {cloudCounts.hardware} hardware
            </ThemedText>
          ) : null
        ) : null}

        <View style={styles.tabRow}>
          {(['experiments', 'notes', 'hardware'] as SearchTab[]).map((tab) => {
            const active = activeTab === tab;
            const count = tab === 'experiments' ? experimentHits.length : tab === 'notes' ? noteHits.length : hardwareHits.length;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{`${tab[0].toUpperCase()}${tab.slice(1)} (${count})`}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.resultList}>
          {(activeTab === 'experiments' ? experimentHits : activeTab === 'notes' ? noteHits : hardwareHits).map((row) => (
            <Pressable
              key={`${row.entity_type}-${row.entity_id}`}
              style={[styles.resultCard, { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated }]}>
              <HighlightedText text={row.title} query={query} />
              <ThemedText style={{ color: themeColors.mutedText }}>
                {row.project_title ? `Project: ${row.project_title}` : 'Project context unavailable'}
              </ThemedText>
              {row.snippet ? (
                <ThemedText style={{ color: themeColors.subtleText }} numberOfLines={2}>
                  {row.snippet}
                </ThemedText>
              ) : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <AdvancedFilterSheet
        isOpen={isFilterSheetOpen}
        values={filters}
        hardwareOptions={hardware}
        tagOptions={tagOptions}
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
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  resultList: { gap: 10 },
  resultCard: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
});
