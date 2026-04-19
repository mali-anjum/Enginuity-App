import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type HomeFabCreateSheetProps = {
  isOpen: boolean;
  /** When false, experiment action should be unavailable (no projects yet). */
  hasProjects: boolean;
  /** Most recently updated project title for experiment subtitle. */
  recentProjectTitle?: string | null;
  onCreateProject: () => void;
  onCreateExperiment: () => void;
  onClose: () => void;
};

export function HomeFabCreateSheet({
  isOpen,
  hasProjects,
  recentProjectTitle,
  onCreateProject,
  onCreateExperiment,
  onClose,
}: HomeFabCreateSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  if (!isOpen) return null;

  const experimentSubtitle = !hasProjects
    ? 'Create a project first'
    : recentProjectTitle
      ? `Uses your most recent project: ${recentProjectTitle}`
      : 'Opens in your most recently updated project';

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <ThemedView
        style={[
          styles.sheet,
          {
            backgroundColor: themeColors.surfaceElevated,
            borderColor: themeColors.border,
          },
        ]}>
        <ThemedText type="subtitle">Create</ThemedText>
        <View style={styles.actions}>
          <Pressable
            onPress={onCreateProject}
            style={[styles.actionButton, { borderColor: themeColors.border }]}>
            <ThemedText type="defaultSemiBold">New Project</ThemedText>
            <ThemedText style={{ color: themeColors.mutedText }}>
              Name, timeline, and status for a new workspace
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => {
              if (!hasProjects) return;
              onCreateExperiment();
            }}
            disabled={!hasProjects}
            style={[
              styles.actionButton,
              {
                borderColor: themeColors.border,
                opacity: hasProjects ? 1 : 0.55,
              },
            ]}>
            <ThemedText type="defaultSemiBold">New Experiment</ThemedText>
            <ThemedText style={{ color: themeColors.mutedText }}>{experimentSubtitle}</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.36)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 12,
    minHeight: 170,
  },
  actions: {
    gap: 8,
  },
  actionButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 2,
  },
});
