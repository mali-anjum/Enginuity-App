import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { TagChip } from '@/common/atoms/tag-chip';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllExperiments } from '@/experiment/state/experimentSlice';
import { selectAllTags } from '@/notes/state/notesSlice';
import { selectAllProjects } from '@/project/state/projectSlice';
import { useAppSelector } from '@/sharedModules/state/hooks';

export type NoteFormValues = {
  title: string;
  body: string;
  tags: string[];
  projectId: string;
  experimentId: string;
};

type NoteFormProps = {
  values: NoteFormValues;
  onChange: (patch: Partial<NoteFormValues>) => void;
  onAddCustomTag: (tag: string) => void;
  submitLabel: string;
  onSubmit: () => void;
};

export function NoteForm({ values, onChange, onAddCustomTag, submitLabel, onSubmit }: NoteFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const projects = useAppSelector(selectAllProjects);
  const experiments = useAppSelector(selectAllExperiments);
  const allTags = useAppSelector(selectAllTags);
  const [customTagInput, setCustomTagInput] = useState('');
  const orderedTags = useMemo(
    () => [...new Set([...values.tags, ...allTags])].sort((a, b) => a.localeCompare(b)),
    [allTags, values.tags],
  );

  const toggleTag = (tag: string) => {
    if (values.tags.includes(tag)) {
      onChange({ tags: values.tags.filter((item) => item !== tag) });
      return;
    }
    onChange({ tags: [...values.tags, tag] });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Title</ThemedText>
        <TextInput
          value={values.title}
          onChangeText={(text) => onChange({ title: text })}
          placeholder="Note title"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Body (use **bold** and *italic*)</ThemedText>
        <TextInput
          multiline
          value={values.body}
          onChangeText={(text) => onChange({ body: text })}
          placeholder="Write your note..."
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, styles.textArea, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Tags</ThemedText>
        <View style={styles.choiceWrap}>
          {orderedTags.map((tag) => (
            <TagChip key={tag} label={tag} onPress={() => toggleTag(tag)} />
          ))}
        </View>
        <View style={styles.customTagRow}>
          <TextInput
            value={customTagInput}
            onChangeText={setCustomTagInput}
            placeholder="Add custom tag"
            placeholderTextColor={themeColors.mutedText}
            style={[styles.input, styles.customTagInput, { borderColor: themeColors.border, color: themeColors.text }]}
          />
          <Pressable
            style={[styles.addTagButton, { borderColor: themeColors.primary }]}
            onPress={() => {
              const trimmed = customTagInput.trim();
              if (!trimmed) return;
              onAddCustomTag(trimmed);
              if (!values.tags.includes(trimmed)) {
                onChange({ tags: [...values.tags, trimmed] });
              }
              setCustomTagInput('');
            }}>
            <ThemedText style={{ color: themeColors.primary }}>+ Tag</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Link to Project</ThemedText>
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
            <ThemedText>none</ThemedText>
          </Pressable>
          {projects.map((project) => (
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
      </View>

      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Link to Experiment</ThemedText>
        <View style={styles.choiceWrap}>
          <Pressable
            onPress={() => onChange({ experimentId: '' })}
            style={[
              styles.choiceChip,
              {
                borderColor: values.experimentId === '' ? themeColors.primary : themeColors.border,
                backgroundColor: values.experimentId === '' ? themeColors.heroTint : themeColors.background,
              },
            ]}>
            <ThemedText>none</ThemedText>
          </Pressable>
          {experiments.map((experiment) => (
            <Pressable
              key={experiment.id}
              onPress={() => onChange({ experimentId: experiment.id })}
              style={[
                styles.choiceChip,
                {
                  borderColor: values.experimentId === experiment.id ? themeColors.primary : themeColors.border,
                  backgroundColor:
                    values.experimentId === experiment.id ? themeColors.heroTint : themeColors.background,
                },
              ]}>
              <ThemedText>{experiment.title}</ThemedText>
            </Pressable>
          ))}
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
  textArea: {
    minHeight: 130,
    textAlignVertical: 'top',
  },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  customTagRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  customTagInput: { flex: 1 },
  addTagButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  choiceChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
