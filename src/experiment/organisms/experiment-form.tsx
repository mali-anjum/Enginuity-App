import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import {
  EXPERIMENT_STATUSES,
  experimentStatusLabel,
  type ExperimentStatus,
} from '@/experiment/constants';
import { selectAllProjects } from '@/project/state/projectSlice';
import { useAppSelector } from '@/sharedModules/state/hooks';

export type ExperimentFormValues = {
  title: string;
  projectId: string;
  objective: string;
  observations: string;
  githubCommit: string;
  status: ExperimentStatus;
  tagsInput: string;
};

export type SelectedHardwareChip = {
  id: string;
  name: string;
  category: string;
};

type ExperimentFormProps = {
  values: ExperimentFormValues;
  selectedHardwareCount: number;
  selectedHardwareChips: SelectedHardwareChip[];
  /** When set, project is fixed (e.g. opened from project detail) for faster logging. */
  lockedProjectTitle?: string;
  onRemoveHardware?: (hardwareId: string) => void;
  onChange: (patch: Partial<ExperimentFormValues>) => void;
  onOpenHardwarePicker: () => void;
  onAddPhoto: () => void;
  onAttachFile: () => void;
  attachmentPreviewUrls: string[];
  fileAttachmentCount: number;
  submitLabel: string;
  onSubmit: () => void;
};

export function ExperimentForm({
  values,
  selectedHardwareCount,
  selectedHardwareChips,
  lockedProjectTitle,
  onRemoveHardware,
  onChange,
  onOpenHardwarePicker,
  onAddPhoto,
  onAttachFile,
  attachmentPreviewUrls,
  fileAttachmentCount,
  submitLabel,
  onSubmit,
}: ExperimentFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const projects = useAppSelector(selectAllProjects);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Title</ThemedText>
        <TextInput
          value={values.title}
          onChangeText={(text) => onChange({ title: text })}
          placeholder="Short label for this run"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Objective</ThemedText>
        <TextInput
          value={values.objective}
          onChangeText={(text) => onChange({ objective: text })}
          placeholder="What are you testing?"
          placeholderTextColor={themeColors.mutedText}
          multiline
          style={[styles.input, styles.textAreaCompact, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Observations</ThemedText>
        <TextInput
          value={values.observations}
          onChangeText={(text) => onChange({ observations: text })}
          placeholder="What happened (optional for a quick log)"
          placeholderTextColor={themeColors.mutedText}
          multiline
          style={[styles.input, styles.textArea, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Status</ThemedText>
        <View style={styles.choiceWrap}>
          {EXPERIMENT_STATUSES.map((status) => {
            const selected = values.status === status;
            return (
              <Pressable
                key={status}
                onPress={() => onChange({ status })}
                style={[
                  styles.choiceChip,
                  {
                    borderColor: selected ? themeColors.primary : themeColors.border,
                    backgroundColor: selected ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{experimentStatusLabel(status)}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">GitHub commit</ThemedText>
        <TextInput
          value={values.githubCommit}
          onChangeText={(text) => onChange({ githubCommit: text })}
          placeholder="abc1237 or github.com/org/repo/commit/..."
          placeholderTextColor={themeColors.mutedText}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      {lockedProjectTitle ? (
        <View style={styles.group}>
          <ThemedText type="defaultSemiBold">Project</ThemedText>
          <View style={[styles.input, styles.lockedProject, { borderColor: themeColors.border }]}>
            <ThemedText>{lockedProjectTitle}</ThemedText>
            <ThemedText style={{ color: themeColors.mutedText, fontSize: 12 }}>
              Linked from project — change via Edit if needed.
            </ThemedText>
          </View>
        </View>
      ) : (
        <View style={styles.group}>
          <ThemedText type="defaultSemiBold">Project</ThemedText>
          <View style={styles.choiceWrap}>
            {projects.map((project) => {
              const selected = values.projectId === project.id;
              return (
                <Pressable
                  key={project.id}
                  onPress={() => onChange({ projectId: project.id })}
                  style={[
                    styles.choiceChip,
                    {
                      borderColor: selected ? themeColors.primary : themeColors.border,
                      backgroundColor: selected ? themeColors.heroTint : themeColors.background,
                    },
                  ]}>
                  <ThemedText>{project.title}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Hardware</ThemedText>
        <Pressable
          onPress={onOpenHardwarePicker}
          style={[styles.input, styles.pickerButton, { borderColor: themeColors.border }]}>
          <ThemedText>
            {selectedHardwareCount > 0
              ? `${selectedHardwareCount} selected — tap to change`
              : 'Choose from hardware library (optional)'}
          </ThemedText>
        </Pressable>
        {selectedHardwareChips.length > 0 ? (
          <View style={styles.chipWrap}>
            {selectedHardwareChips.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onRemoveHardware?.(item.id)}
                disabled={!onRemoveHardware}
                style={[
                  styles.hardwareChip,
                  {
                    borderColor: themeColors.primary,
                    backgroundColor: themeColors.heroTint,
                  },
                ]}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[styles.chipCategory, { color: themeColors.mutedText }]}>
                  {item.category}
                </ThemedText>
                {onRemoveHardware ? (
                  <ThemedText style={[styles.removeHint, { color: themeColors.primary }]}>✕</ThemedText>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Tags (comma separated)</ThemedText>
        <TextInput
          value={values.tagsInput}
          onChangeText={(text) => onChange({ tagsInput: text })}
          placeholder="PID, ESP32, UART"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Photos</ThemedText>
        <Pressable
          onPress={onAddPhoto}
          style={[styles.input, styles.pickerButton, { borderColor: themeColors.border }]}>
          <ThemedText>Add Photo</ThemedText>
        </Pressable>
        <Pressable
          onPress={onAttachFile}
          style={[styles.input, styles.pickerButton, { borderColor: themeColors.border }]}>
          <ThemedText>Attach File (CSV/PDF)</ThemedText>
        </Pressable>
        {attachmentPreviewUrls.length > 0 ? (
          <ThemedText style={{ color: themeColors.mutedText }}>
            {attachmentPreviewUrls.length} photo{attachmentPreviewUrls.length === 1 ? '' : 's'} selected/uploaded.
          </ThemedText>
        ) : null}
        {fileAttachmentCount > 0 ? (
          <ThemedText style={{ color: themeColors.mutedText }}>
            {fileAttachmentCount} file attachment{fileAttachmentCount === 1 ? '' : 's'} selected/uploaded.
          </ThemedText>
        ) : null}
      </View>

      <Pressable style={[styles.submitButton, { backgroundColor: themeColors.primary }]} onPress={onSubmit}>
        <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
          {submitLabel}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  group: { gap: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  lockedProject: { gap: 4, minHeight: 44, justifyContent: 'center' },
  pickerButton: { minHeight: 44, justifyContent: 'center' },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  textAreaCompact: { minHeight: 56, textAlignVertical: 'top' },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hardwareChip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  chipCategory: { fontSize: 12 },
  removeHint: { fontSize: 14, marginLeft: 2 },
  submitButton: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
