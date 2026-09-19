import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllExperiments } from '@/experiment/state/experimentSlice';
import { selectAllNotes } from '@/notes/state/notesSlice';
import { selectAllProjects } from '@/project/state/projectSlice';
import { useAppSelector } from '@/store/hooks';

type ResultTab = 'projects' | 'experiments' | 'notes';

const TABS: ResultTab[] = ['projects', 'experiments', 'notes'];

export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{
    query?: string;
    status?: string;
    projectId?: string;
    hardwareId?: string;
    tag?: string;
    dateFrom?: string;
    dateTo?: string;
  }>();
  const query = (params.query ?? '').toLowerCase();
  const [activeTab, setActiveTab] = useState<ResultTab>('projects');
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const projects = useAppSelector(selectAllProjects);
  const experiments = useAppSelector(selectAllExperiments);
  const notes = useAppSelector(selectAllNotes);

  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      if (params.status && item.status !== params.status) return false;
      if (query && !item.title.toLowerCase().includes(query) && !item.description.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [projects, query, params.status]);

  const filteredExperiments = useMemo(() => {
    return experiments.filter((item) => {
      if (params.status && item.status !== params.status) return false;
      if (params.projectId && item.projectId !== params.projectId) return false;
      if (params.hardwareId && !item.hardwareIds.includes(params.hardwareId)) return false;
      const haystack =
        `${item.title} ${item.objective} ${item.observations}`.toLowerCase();
      if (query && !haystack.includes(query)) {
        return false;
      }
      return true;
    });
  }, [experiments, query, params.status, params.projectId, params.hardwareId]);

  const filteredNotes = useMemo(() => {
    return notes.filter((item) => {
      if (params.projectId && item.projectId !== params.projectId) return false;
      if (params.tag && !item.tags.includes(params.tag)) return false;
      if (query && !item.title.toLowerCase().includes(query) && !item.body.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [notes, query, params.projectId, params.tag]);

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Search Results</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Query: {params.query || '(none)'} | status: {params.status || 'all'}
        </ThemedText>

        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = tab === activeTab;
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
                <ThemedText>{tab}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'projects' ? (
          <ResultBlock
            title="Projects"
            items={filteredProjects.map((item) => `${item.title} - ${item.status}`)}
          />
        ) : null}
        {activeTab === 'experiments' ? (
          <ResultBlock
            title="Experiments"
            items={filteredExperiments.map((item) => `${item.title} - ${item.status.replace('_', ' ')}`)}
          />
        ) : null}
        {activeTab === 'notes' ? (
          <ResultBlock title="Notes" items={filteredNotes.map((item) => `${item.title} - ${item.tags.join(', ')}`)} />
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

function ResultBlock({ title, items }: { title: string; items: string[] }) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  return (
    <View style={styles.resultBlock}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {items.length === 0 ? (
        <ThemedText style={{ color: themeColors.mutedText }}>No results.</ThemedText>
      ) : (
        items.map((item) => (
          <View key={item} style={[styles.resultRow, { borderColor: themeColors.border }]}>
            <ThemedText>{item}</ThemedText>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  resultBlock: { gap: 8 },
  resultRow: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9 },
});
