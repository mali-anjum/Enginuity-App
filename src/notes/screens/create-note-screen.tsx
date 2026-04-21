import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { NoteForm, type NoteFormValues } from '@/notes/components/note-form';
import { createNoteThunk } from '@/notes/state/notesSlice';
import { useAppDispatch } from '@/sharedModules/state/hooks';

const INITIAL_VALUES: NoteFormValues = {
  title: '',
  body: '',
  tagsInput: '',
  projectId: '',
  experimentId: '',
};

export default function CreateNoteScreen() {
  const { projectId, experimentId } = useLocalSearchParams<{ projectId?: string; experimentId?: string }>();
  const [values, setValues] = useState<NoteFormValues>({
    ...INITIAL_VALUES,
    projectId: projectId ?? '',
    experimentId: experimentId ?? '',
  });
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Create Note</ThemedText>
        <NoteForm
          values={values}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          submitLabel="Save Note"
          onSubmit={() => {
            if (!values.title.trim()) return;
            const tags = values.tagsInput
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean);
            void dispatch(
              createNoteThunk({
                title: values.title.trim(),
                body: values.body.trim(),
                projectId: values.projectId || null,
                experimentId: values.experimentId || null,
                tags,
              }),
            );
            router.replace('/notes');
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});
