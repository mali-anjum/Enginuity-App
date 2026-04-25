import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { NoteForm, type NoteFormValues } from '@/notes/organisms/note-form';
import { createCustomTagThunk, selectNoteById, updateNoteThunk } from '@/notes/state/notesSlice';
import { ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function EditNoteScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const note = useAppSelector(selectNoteById(noteId ?? ''));
  const router = useRouter();
  const dispatch = useAppDispatch();

  const initialValues = useMemo<NoteFormValues>(
    () => ({
      title: note?.title ?? '',
      body: note?.body ?? '',
      tags: note?.tags ?? [],
      projectId: note?.projectId ?? '',
      experimentId: note?.experimentId ?? '',
    }),
    [note],
  );
  const { watch, setValue, handleSubmit } = useForm<NoteFormValues>({
    values: initialValues,
  });
  const values = watch();

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
          onChange={(patch) => {
            for (const [key, value] of Object.entries(patch)) {
              setValue(key as keyof NoteFormValues, value as never);
            }
          }}
          onAddCustomTag={(tag) => void dispatch(createCustomTagThunk(tag))}
          submitLabel="Update Note"
          onSubmit={handleSubmit((formValues) => {
            if (!formValues.title.trim()) return;
            void dispatch(
              updateNoteThunk({
                ...note,
                title: formValues.title.trim(),
                body: formValues.body.trim(),
                projectId: formValues.projectId || null,
                experimentId: formValues.experimentId || null,
                tags: formValues.tags,
              }),
            );
            router.replace(ROUTE_PATHS.NOTE_DETAIL(note.id));
          })}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },
  content: { gap: 12, paddingBottom: 40 },
});
