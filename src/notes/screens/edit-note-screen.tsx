import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { NoteForm, type NoteFormValues } from '@/notes/components/note-form';
import { selectNoteById, updateNoteThunk } from '@/notes/state/notesSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function EditNoteScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const note = useAppSelector(selectNoteById(noteId ?? ''));
  const router = useRouter();
  const dispatch = useAppDispatch();

  const initialValues = useMemo<NoteFormValues>(
    () => ({
      title: note?.title ?? '',
      body: note?.body ?? '',
      tagsInput: note?.tags.join(', ') ?? '',
      projectId: note?.projectId ?? '',
      experimentId: note?.experimentId ?? '',
    }),
    [note],
  );
  const [values, setValues] = useState<NoteFormValues>(initialValues);

  if (!note) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Note not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Edit Note</ThemedText>
        <NoteForm
          values={values}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          submitLabel="Update Note"
          onSubmit={() => {
            if (!values.title.trim()) return;
            const tags = values.tagsInput
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean);
            void dispatch(
              updateNoteThunk({
                ...note,
                title: values.title.trim(),
                body: values.body.trim(),
                projectId: values.projectId || null,
                experimentId: values.experimentId || null,
                tags,
              }),
            );
            router.replace(`/notes/${note.id}`);
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },
  content: { gap: 12, paddingBottom: 40 },
});
