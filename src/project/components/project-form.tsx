import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import type { ProjectStatus } from '@/project/state/projectSlice';

export type ProjectFormValues = {
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
};

type ProjectFormProps = {
  values: ProjectFormValues;
  onChange: (patch: Partial<ProjectFormValues>) => void;
  submitLabel: string;
  onSubmit: () => void;
};

const STATUS_OPTIONS: ProjectStatus[] = ['active', 'completed', 'archived'];

export function ProjectForm({ values, onChange, submitLabel, onSubmit }: ProjectFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Name</ThemedText>
        <TextInput
          value={values.title}
          onChangeText={(text) => onChange({ title: text })}
          placeholder="Project name"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Description</ThemedText>
        <TextInput
          value={values.description}
          onChangeText={(text) => onChange({ description: text })}
          placeholder="What are you building?"
          placeholderTextColor={themeColors.mutedText}
          multiline
          style={[
            styles.input,
            styles.textArea,
            { borderColor: themeColors.border, color: themeColors.text },
          ]}
        />
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Start Date</ThemedText>
        <TextInput
          value={values.startDate}
          onChangeText={(text) => onChange({ startDate: text })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Due Date</ThemedText>
        <TextInput
          value={values.dueDate}
          onChangeText={(text) => onChange({ dueDate: text })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Status</ThemedText>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((status) => {
            const active = values.status === status;
            return (
              <Pressable
                key={status}
                onPress={() => onChange({ status })}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{status}</ThemedText>
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
  container: {
    gap: 12,
  },
  group: {
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
