import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import type { ExperimentStatus } from '@/experiment/constants';
import type { HardwareItem } from '@/hardware/state/hardwareSlice';
import { TagChip } from '@/common/atoms/tag-chip';

export type AdvancedFilters = {
  dateFrom: string;
  dateTo: string;
  hardwareId: string;
  tagNames: string[];
  status: ExperimentStatus | '';
  projectId: string;
};

type AdvancedFilterSheetProps = {
  isOpen: boolean;
  values: AdvancedFilters;
  hardwareOptions: HardwareItem[];
  projectOptions: { id: string; title: string }[];
  tagOptions: string[];
  onChange: (patch: Partial<AdvancedFilters>) => void;
  onClose: () => void;
};

const STATUS_OPTIONS: (ExperimentStatus | '')[] = ['', 'pending', 'in_progress', 'completed', 'failed'];

export function AdvancedFilterSheet({
  isOpen,
  values,
  hardwareOptions,
  projectOptions,
  tagOptions,
  onChange,
  onClose,
}: AdvancedFilterSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <ThemedView
        style={[
          styles.sheet,
          { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
        ]}>
        <ThemedText type="subtitle">Advanced Filter</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Combine date range, project, hardware, status, and tags.
        </ThemedText>

        <View style={styles.row}>
          <TextInput
            value={values.dateFrom}
            onChangeText={(text) => onChange({ dateFrom: text })}
            placeholder="Date from (YYYY-MM-DD)"
            placeholderTextColor={themeColors.mutedText}
            style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
          />
          <TextInput
            value={values.dateTo}
            onChangeText={(text) => onChange({ dateTo: text })}
            placeholder="Date to (YYYY-MM-DD)"
            placeholderTextColor={themeColors.mutedText}
            style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
          />
        </View>

        <View style={styles.choiceWrap}>
          {STATUS_OPTIONS.map((status) => {
            const active = values.status === status;
            return (
              <Pressable
                key={status || 'all'}
                onPress={() => onChange({ status })}
                style={[
                  styles.choiceChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{status ? status.replace('_', ' ') : 'all status'}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.choiceWrap}>
          {tagOptions.map((tag) => {
            const active = values.tagNames.includes(tag);
            return (
              <TagChip
                key={tag}
                label={tag}
                onPress={() => {
                  if (active) {
                    onChange({ tagNames: values.tagNames.filter((item) => item !== tag) });
                    return;
                  }
                  onChange({ tagNames: [...values.tagNames, tag] });
                }}
              />
            );
          })}
        </View>

        <View style={styles.choiceWrap}>
          <Pressable
            onPress={() => onChange({ hardwareId: '' })}
            style={[
              styles.choiceChip,
              {
                borderColor: values.hardwareId === '' ? themeColors.primary : themeColors.border,
                backgroundColor: values.hardwareId === '' ? themeColors.heroTint : themeColors.background,
              },
            ]}>
            <ThemedText>all hardware</ThemedText>
          </Pressable>
          {hardwareOptions.map((hardware) => (
            <Pressable
              key={hardware.id}
              onPress={() => onChange({ hardwareId: hardware.id })}
              style={[
                styles.choiceChip,
                {
                  borderColor: values.hardwareId === hardware.id ? themeColors.primary : themeColors.border,
                  backgroundColor:
                    values.hardwareId === hardware.id ? themeColors.heroTint : themeColors.background,
                },
              ]}>
              <ThemedText>{hardware.name}</ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.choiceWrap}>
          <Pressable
            onPress={() => onChange({ projectId: '' })}
            style={[
              styles.choiceChip,
              {
                borderColor: values.projectId === '' ? themeColors.primary : themeColors.border,
                backgroundColor: values.projectId === '' ? themeColors.heroTint : themeColors.background,
              },
            ]}>
            <ThemedText>all projects</ThemedText>
          </Pressable>
          {projectOptions.map((project) => (
            <Pressable
              key={project.id}
              onPress={() => onChange({ projectId: project.id })}
              style={[
                styles.choiceChip,
                {
                  borderColor: values.projectId === project.id ? themeColors.primary : themeColors.border,
                  backgroundColor:
                    values.projectId === project.id ? themeColors.heroTint : themeColors.background,
                },
              ]}>
              <ThemedText>{project.title}</ThemedText>
            </Pressable>
          ))}
        </View>

        <Pressable style={[styles.applyButton, { backgroundColor: themeColors.primary }]} onPress={onClose}>
          <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
            Apply Filters
          </ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 45, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.4)' },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 10,
    minHeight: 280,
  },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
  },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  applyButton: { borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
});
