import { Link, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { selectExperimentsByProject } from '@/experiment/state/experimentSlice';
import { selectProjectById } from '@/project/state/projectSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppSelector } from '@/sharedModules/state/hooks';

type DetailTab = 'experiments' | 'notes';

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<DetailTab>('experiments');

  const project = useAppSelector(selectProjectById(projectId ?? ''));
  const experiments = useAppSelector(selectExperimentsByProject(projectId ?? ''));

  if (!project) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Project not found.</ThemedText>
      </ThemedView>
    );
  }

  const experimentCreateHref = `/experiment/create?projectId=${encodeURIComponent(project.id)}` as Href;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <ThemedText type="title">{project.title}</ThemedText>
          <Link href={`/project/${project.id}/edit` as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Edit</ThemedText>
          </Link>
        </View>

        <View
          style={[
            styles.metaCard,
            {
              borderColor: themeColors.border,
              backgroundColor: themeColors.surfaceElevated,
            },
          ]}>
          <ThemedText style={{ color: themeColors.mutedText }}>
            {project.description?.trim() ? project.description : 'No description yet.'}
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText style={{ color: themeColors.mutedText }}>
              Start: {project.startDate ?? '—'}
            </ThemedText>
            <ThemedText style={{ color: themeColors.mutedText }}>
              Due: {project.dueDate ?? '—'}
            </ThemedText>
          </View>
          <View style={styles.statusBadge}>
            <ThemedText type="defaultSemiBold" style={{ textTransform: 'capitalize' }}>
              {project.status}
            </ThemedText>
          </View>
        </View>

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setActiveTab('experiments')}
            style={[
              styles.tabButton,
              styles.tabButtonFlex,
              {
                borderColor: activeTab === 'experiments' ? themeColors.primary : themeColors.border,
                backgroundColor:
                  activeTab === 'experiments' ? themeColors.heroTint : themeColors.background,
              },
            ]}>
            <ThemedText type="defaultSemiBold">Experiments</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('notes')}
            style={[
              styles.tabButton,
              styles.tabButtonFlex,
              {
                borderColor: activeTab === 'notes' ? themeColors.primary : themeColors.border,
                backgroundColor: activeTab === 'notes' ? themeColors.heroTint : themeColors.background,
              },
            ]}>
            <ThemedText type="defaultSemiBold">Notes</ThemedText>
          </Pressable>
        </View>

        {activeTab === 'experiments' ? (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <ThemedText type="defaultSemiBold">Experiments</ThemedText>
              <Link href={experimentCreateHref}>
                <ThemedText style={{ color: themeColors.primary }}>Add experiment</ThemedText>
              </Link>
            </View>
            {experiments.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.surfaceElevated,
                  },
                ]}>
                <ThemedText style={{ color: themeColors.mutedText }}>
                  No experiments yet. Add one to track work inside this project.
                </ThemedText>
                <Link href={experimentCreateHref} asChild>
                  <Pressable
                    style={[styles.primaryOutline, { borderColor: themeColors.primary }]}
                    accessibilityRole="button"
                    accessibilityLabel="Create experiment for this project">
                    <ThemedText style={{ color: themeColors.primary }}>Create experiment</ThemedText>
                  </Pressable>
                </Link>
              </View>
            ) : (
              experiments.map((experiment) => (
                <View
                  key={experiment.id}
                  style={[
                    styles.card,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.surfaceElevated,
                    },
                  ]}>
                  <ThemedText type="defaultSemiBold">{experiment.title}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>
                    {experiment.status.replace('_', ' ')}
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.notesEmpty}>
              <ThemedText style={[styles.emptyIcon, { color: themeColors.mutedText }]}>📝</ThemedText>
              <ThemedText type="defaultSemiBold">Notes coming soon</ThemedText>
              <ThemedText style={[styles.emptyCaption, { color: themeColors.mutedText }]}>
                Project notes will appear here. You can focus on experiments for now.
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tabButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonFlex: {
    flex: 1,
  },
  section: { gap: 10 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  primaryOutline: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  emptyIcon: {
    fontSize: 40,
    lineHeight: 44,
  },
  notesEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyCaption: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
