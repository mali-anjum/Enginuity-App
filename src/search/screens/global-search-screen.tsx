import { Link, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { Colors, Radii, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { selectAllTags } from '@/notes/state/notesSlice';
import { selectAllProjects } from '@/project/state/projectSlice';
import { useAppSelector } from '@/store/hooks';

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

function HighlightedText({
  text,
  query,
  style,
  numberOfLines,
}: {
  text: string;
  query: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const q = query.trim();
  if (!q) {
    return (
      <ThemedText style={style} numberOfLines={numberOfLines}>
        {text}
      </ThemedText>
    );
  }
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index < 0) {
    return (
      <ThemedText style={style} numberOfLines={numberOfLines}>
        {text}
      </ThemedText>
    );
  }
  const start = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const end = text.slice(index + q.length);
  return (
    <ThemedText style={style} numberOfLines={numberOfLines}>
      {start}
      <Text style={{ fontWeight: '700' }}>{match}</Text>
      {end}
    </ThemedText>
  );
}

/** Strip Postgres ts_headline markup (<b>...</b>) for consistent client highlighting. */
function stripTsHeadlineMarkup(html: string): string {
  return html.replace(/<\/?b>/gi, '').replace(/<\/?[^>]+>/g, '');
}

function searchResultHref(row: GlobalSearchEntityRow): Href {
  if (row.entity_type === 'experiment') {
    return `/experiment/${row.entity_id}` as Href;
  }
  if (row.entity_type === 'note') {
    return `/notes/${row.entity_id}` as Href;
  }
  if (row.entity_type === 'hardware') {
    return `/hardware/${row.entity_id}` as Href;
  }
  return '/search' as Href;
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
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Global Search</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Search experiment titles and observations, note titles and bodies, and hardware names (Supabase FTS).
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
          <ThemedText>Filter</ThemedText>
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
            <Link key={`${row.entity_type}-${row.entity_id}`} href={searchResultHref(row)} asChild>
              <Pressable
                style={[styles.resultCard, { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated }]}>
                <HighlightedText text={row.title} query={query} />
                <ThemedText style={{ color: themeColors.mutedText }}>
                  {row.project_title ? `Project: ${row.project_title}` : 'Project context unavailable'}
                </ThemedText>
                {row.snippet ? (
                  <HighlightedText
                    text={stripTsHeadlineMarkup(row.snippet)}
                    query={query}
                    numberOfLines={2}
                    style={{ color: themeColors.subtleText }}
                  />
                ) : null}
              </Pressable>
            </Link>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  searchInput: { borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: 15 },
  filterButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, alignSelf: 'flex-start' },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  resultList: { gap: 10 },
  resultCard: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
});
