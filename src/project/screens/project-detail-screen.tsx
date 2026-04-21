import { Link, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ExperimentStatusChip } from '@/experiment/molecules/experiment-status-chip';
import { enqueueExperimentRemoteSync } from '@/experiment/services/experimentRemoteSync';
import { cycleExperimentStatus, selectExperimentsByProject } from '@/experiment/state/experimentSlice';
import { selectNotesByProject } from '@/notes/state/notesSlice';
import { selectProjectById } from '@/project/state/projectSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

type DetailTab = 'experiments' | 'notes';

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<DetailTab>('experiments');

  const project = useAppSelector(selectProjectById(projectId ?? ''));
  const experiments = useAppSelector(selectExperimentsByProject(projectId ?? ''));
  const notes = useAppSelector(selectNotesByProject(projectId ?? ''));

  const experimentsSorted = useMemo(
    () =>
      [...experiments].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [experiments],
  );

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
            {experimentsSorted.length === 0 ? (
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
              experimentsSorted.map((experiment) => (
                <View
                  key={experiment.id}
                  style={[
                    styles.experimentRow,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.surfaceElevated,
                    },
                  ]}>
                  <Link href={`/experiment/${experiment.id}` as Href} asChild>
                    <Pressable
                      style={styles.experimentMain}
                      accessibilityRole="button"
                      accessibilityLabel={`Open experiment ${experiment.title}`}>
                      <ThemedText type="defaultSemiBold" numberOfLines={2}>
                        {experiment.title}
                      </ThemedText>
                      <ThemedText style={[styles.metaHint, { color: themeColors.mutedText }]}>
                        Updated {new Date(experiment.updatedAt).toLocaleDateString()}
                      </ThemedText>
                    </Pressable>
                  </Link>
                  <ExperimentStatusChip
                    status={experiment.status}
                    onPress={() => {
                      dispatch(
                        cycleExperimentStatus({
                          experimentId: experiment.id,
                          projectId: experiment.projectId,
                        }),
                      );
                      enqueueExperimentRemoteSync(experiment.id);
                    }}
                  />
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <ThemedText type="defaultSemiBold">Notes</ThemedText>
              <Link href={`/notes/create?projectId=${encodeURIComponent(project.id)}` as Href}>
                <ThemedText style={{ color: themeColors.primary }}>Add note</ThemedText>
              </Link>
            </View>
            {notes.length === 0 ? (
              <View style={styles.notesEmpty}>
                <ThemedText style={[styles.emptyIcon, { color: themeColors.mutedText }]}>📝</ThemedText>
                <ThemedText type="defaultSemiBold">No project notes yet</ThemedText>
                <ThemedText style={[styles.emptyCaption, { color: themeColors.mutedText }]}>
                  Linked notes appear here so your design decisions stay with this project.
                </ThemedText>
              </View>
            ) : (
              notes.map((note) => (
                <Link key={note.id} href={`/notes/${note.id}` as Href} asChild>
                  <Pressable
                    style={[
                      styles.noteCard,
                      {
                        borderColor: themeColors.border,
                        backgroundColor: themeColors.surfaceElevated,
                      },
                    ]}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                      {note.title}
                    </ThemedText>
                    <ThemedText style={[styles.metaHint, { color: themeColors.mutedText }]} numberOfLines={2}>
                      {note.body || 'No note body.'}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))
            )}
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
  experimentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  experimentMain: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingVertical: 2,
  },
  metaHint: {
    fontSize: 12,
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
  noteCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
});
