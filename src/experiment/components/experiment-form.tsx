import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllProjects } from '@/project/state/projectSlice';
import { useAppSelector } from '@/sharedModules/state/hooks';

export type ExperimentFormValues = {
  title: string;
  projectId: string;
  codeRef: string;
  notes: string;
  status: 'draft' | 'in_progress' | 'completed';
  attachmentInput: string;
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
  onRemoveHardware?: (hardwareId: string) => void;
  onChange: (patch: Partial<ExperimentFormValues>) => void;
  onOpenHardwarePicker: () => void;
  submitLabel: string;
  onSubmit: () => void;
};

const STATUS_OPTIONS: ExperimentFormValues['status'][] = ['draft', 'in_progress', 'completed'];

export function ExperimentForm({
  values,
  selectedHardwareCount,
  selectedHardwareChips,
  onRemoveHardware,
  onChange,
  onOpenHardwarePicker,
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
          placeholder="Experiment title"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

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

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Hardware</ThemedText>
        <Pressable
          onPress={onOpenHardwarePicker}
          style={[styles.input, styles.pickerButton, { borderColor: themeColors.border }]}>
          <ThemedText>
            {selectedHardwareCount > 0
              ? `${selectedHardwareCount} selected — tap to change`
              : 'Choose from hardware library (multi-select)'}
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
        <ThemedText type="defaultSemiBold">Code Ref</ThemedText>
        <TextInput
          value={values.codeRef}
          onChangeText={(text) => onChange({ codeRef: text })}
          placeholder="commit/hash/file path"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Notes</ThemedText>
        <TextInput
          value={values.notes}
          onChangeText={(text) => onChange({ notes: text })}
          placeholder="Experiment observations"
          placeholderTextColor={themeColors.mutedText}
          multiline
          style={[styles.input, styles.textArea, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Attachment URL</ThemedText>
        <TextInput
          value={values.attachmentInput}
          onChangeText={(text) => onChange({ attachmentInput: text })}
          placeholder="https://... or file-name.csv"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Status</ThemedText>
        <View style={styles.choiceWrap}>
          {STATUS_OPTIONS.map((status) => {
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
                <ThemedText>{status.replace('_', ' ')}</ThemedText>
              </Pressable>
            );
          })}
        </View>
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
  pickerButton: { minHeight: 44, justifyContent: 'center' },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
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
