import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllExperiments } from '@/experiment/state/experimentSlice';
import { selectAllProjects } from '@/project/state/projectSlice';
import { useAppSelector } from '@/sharedModules/state/hooks';

export type NoteFormValues = {
  title: string;
  body: string;
  tagsInput: string;
  projectId: string;
  experimentId: string;
};

type NoteFormProps = {
  values: NoteFormValues;
  onChange: (patch: Partial<NoteFormValues>) => void;
  submitLabel: string;
  onSubmit: () => void;
};

export function NoteForm({ values, onChange, submitLabel, onSubmit }: NoteFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const projects = useAppSelector(selectAllProjects);
  const experiments = useAppSelector(selectAllExperiments);

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
        <ThemedText type="defaultSemiBold">Tags (comma separated)</ThemedText>
        <TextInput
          value={values.tagsInput}
          onChangeText={(text) => onChange({ tagsInput: text })}
          placeholder="electronics, testing, firmware"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
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
