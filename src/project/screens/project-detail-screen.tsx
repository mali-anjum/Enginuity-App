import { Link, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { selectExperimentsByProject } from '@/experiment/state/experimentSlice';
import { selectNotesByProject } from '@/notes/state/notesSlice';
import {
  attachProjectFileThunk,
  selectProjectById,
  toggleFavouriteThunk,
  toggleProjectStatusThunk,
} from '@/project/state/projectSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

type DetailTab = 'overview' | 'experiments' | 'notes' | 'files';

const TABS: DetailTab[] = ['overview', 'experiments', 'notes', 'files'];

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const project = useAppSelector(selectProjectById(projectId ?? ''));
  const experiments = useAppSelector(selectExperimentsByProject(projectId ?? ''));
  const notes = useAppSelector(selectNotesByProject(projectId ?? ''));

  const fileItems = useMemo(() => project?.fileUrls ?? [], [project?.fileUrls]);

  if (!project) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Project not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <ThemedText type="title">{project.title}</ThemedText>
          <Link href={`/project/${project.id}/edit` as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Edit</ThemedText>
          </Link>
        </View>

        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabButton,
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

        {activeTab === 'overview' ? (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Metadata</ThemedText>
            <ThemedText>{project.description || 'No description provided.'}</ThemedText>
            <ThemedText style={{ color: themeColors.mutedText }}>
              Start: {project.startDate ?? '-'} | Due: {project.dueDate ?? '-'}
            </ThemedText>
            <ThemedText style={{ color: themeColors.mutedText }}>Status: {project.status}</ThemedText>
            <View style={styles.rowActions}>
              <Pressable
                style={[styles.actionButton, { borderColor: themeColors.border }]}
                onPress={() => {
                  void dispatch(toggleProjectStatusThunk(project.id));
                }}>
                <ThemedText>Toggle Status</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionButton, { borderColor: themeColors.border }]}
                onPress={() => {
                  void dispatch(toggleFavouriteThunk(project.id));
                }}>
                <ThemedText>{project.isFavourite ? 'Unfavourite' : 'Favourite'}</ThemedText>
              </Pressable>
            </View>
          </View>
        ) : null}

        {activeTab === 'experiments' ? (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Project Experiments</ThemedText>
            {experiments.length === 0 ? (
              <ThemedText style={{ color: themeColors.mutedText }}>
                No experiments linked to this project.
              </ThemedText>
            ) : (
              experiments.map((experiment) => (
                <View key={experiment.id} style={[styles.card, { borderColor: themeColors.border }]}>
                  <ThemedText type="defaultSemiBold">{experiment.title}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>
                    {experiment.status.replace('_', ' ')}
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        ) : null}

        {activeTab === 'notes' ? (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Project Notes</ThemedText>
            {notes.length === 0 ? (
              <ThemedText style={{ color: themeColors.mutedText }}>
                No notes linked to this project.
              </ThemedText>
            ) : (
              notes.map((note) => (
                <View key={note.id} style={[styles.card, { borderColor: themeColors.border }]}>
                  <ThemedText type="defaultSemiBold">{note.title}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }} numberOfLines={2}>
                    {note.body}
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        ) : null}

        {activeTab === 'files' ? (
          <View style={styles.section}>
            <View style={styles.topRow}>
              <ThemedText type="defaultSemiBold">Project Files</ThemedText>
              <Pressable
                onPress={() => {
                  void dispatch(
                    attachProjectFileThunk({
                      projectId: project.id,
                      fileUrl: `sample-file-${Date.now()}.pdf`,
                    }),
                  );
                }}>
                <ThemedText style={{ color: themeColors.primary }}>Attach file</ThemedText>
              </Pressable>
            </View>
            {fileItems.length === 0 ? (
              <ThemedText style={{ color: themeColors.mutedText }}>
                No files attached yet. Add CSVs, images, or PDFs.
              </ThemedText>
            ) : (
              fileItems.map((file) => (
                <View key={file} style={[styles.card, { borderColor: themeColors.border }]}>
                  <ThemedText>{file}</ThemedText>
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabButton: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  section: { gap: 8 },
  rowActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  card: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, gap: 3 },
});
