import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ExperimentStatusChip } from '@/experiment/molecules/experiment-status-chip';
import { enqueueExperimentRemoteSync } from '@/experiment/services/experimentRemoteSync';
import { cycleExperimentStatus, selectExperimentsByProject } from '@/experiment/state/experimentSlice';
import { selectNotesByProject } from '@/notes/state/notesSlice';
import { ShareProjectSheet } from '@/project/organisms/share-project-sheet';
import {
  inviteProjectMemberThunk,
  selectProjectById,
  selectProjectCanEdit,
} from '@/project/state/projectSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { addToast } from '@/ui/state/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

type DetailTab = 'experiments' | 'notes';

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<DetailTab>('experiments');
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isInviteSending, setIsInviteSending] = useState(false);

  const project = useAppSelector(selectProjectById(projectId ?? ''));
  const canEditProject = useAppSelector(selectProjectCanEdit(projectId ?? ''));
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
      <ScreenContainer style={styles.screen}>
        <ThemedText>Project not found.</ThemedText>
      </ScreenContainer>
    );
  }

  const experimentCreateHref = ROUTE_PATHS.EXPERIMENT_CREATE_FOR_PROJECT(project.id);

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <ThemedText type="title">{project.title}</ThemedText>
          <View style={styles.topActions}>
            <Pressable onPress={() => setIsShareSheetOpen(true)}>
              <ThemedText style={{ color: themeColors.primary }}>Share</ThemedText>
            </Pressable>
            {canEditProject ? (
              <Link href={ROUTE_PATHS.PROJECT_EDIT(project.id)}>
                <ThemedText style={{ color: themeColors.primary }}>Edit</ThemedText>
              </Link>
            ) : null}
          </View>
        </View>
        {project.sharedWithMe ? (
          <View style={[styles.sharedBadge, { borderColor: themeColors.accentBorder, backgroundColor: themeColors.accentSoft }]}>
            <ThemedText type="defaultSemiBold">Shared with me · {project.accessRole}</ThemedText>
          </View>
        ) : null}

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
              {canEditProject ? (
                <Link href={experimentCreateHref}>
                  <ThemedText style={{ color: themeColors.primary }}>Add experiment</ThemedText>
                </Link>
              ) : null}
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
                {canEditProject ? (
                  <Link href={experimentCreateHref} asChild>
                    <Pressable
                      style={[styles.primaryOutline, { borderColor: themeColors.primary }]}
                      accessibilityRole="button"
                      accessibilityLabel="Create experiment for this project">
                      <ThemedText style={{ color: themeColors.primary }}>Create experiment</ThemedText>
                    </Pressable>
                  </Link>
                ) : (
                  <Pressable
                    style={[styles.primaryOutline, { borderColor: themeColors.border }]}
                    disabled>
                    <ThemedText style={{ color: themeColors.mutedText }}>
                      Viewer access cannot create experiments
                    </ThemedText>
                  </Pressable>
                )}
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
                  <Link href={ROUTE_PATHS.EXPERIMENT_DETAIL(experiment.id)} asChild>
                    <Pressable
                      style={styles.experimentMain}
                      accessibilityRole="button"
                      accessibilityLabel={`Open experiment ${experiment.title}`}>
                      <ThemedText type="defaultSemiBold" numberOfLines={2}>
                        {experiment.title}
                      </ThemedText>
                      <ThemedText type="caption" style={{ color: themeColors.mutedText }}>
                        Updated {new Date(experiment.updatedAt).toLocaleDateString()}
                      </ThemedText>
                    </Pressable>
                  </Link>
                  <ExperimentStatusChip
                    status={experiment.status}
                    onPress={() => {
                      if (!canEditProject) {
                        dispatch(
                          addToast({
                            message: 'Viewer access cannot edit experiment status.',
                            variant: 'info',
                          }),
                        );
                        return;
                      }
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
              {canEditProject ? (
                <Link href={ROUTE_PATHS.NOTES_CREATE_FOR_PROJECT(project.id)}>
                  <ThemedText style={{ color: themeColors.primary }}>Add note</ThemedText>
                </Link>
              ) : null}
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
                <Link key={note.id} href={ROUTE_PATHS.NOTE_DETAIL(note.id)} asChild>
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
                    <ThemedText type="caption" style={{ color: themeColors.mutedText }} numberOfLines={2}>
                      {note.body || 'No note body.'}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))
            )}
          </View>
        )}
      </ScrollView>
      <ShareProjectSheet
        visible={isShareSheetOpen}
        isSubmitting={isInviteSending}
        onClose={() => setIsShareSheetOpen(false)}
        onSubmit={({ email, role }) => {
          if (!email || !projectId) return;
          setIsInviteSending(true);
          void (async () => {
            try {
              await dispatch(inviteProjectMemberThunk({ projectId, email, role })).unwrap();
              dispatch(
                addToast({
                  message: `Invite sent to ${email}`,
                  variant: 'success',
                }),
              );
              setIsShareSheetOpen(false);
            } finally {
              setIsInviteSending(false);
            }
          })();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sharedBadge: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
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
