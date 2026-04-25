import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { selectExperimentById } from '@/experiment/state/experimentSlice';
import { NoteForm, type NoteFormValues } from '@/notes/organisms/note-form';
import { createCustomTagThunk, createNoteThunk } from '@/notes/state/notesSlice';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const INITIAL_VALUES: NoteFormValues = {
  title: '',
  body: '',
  tags: [],
  projectId: '',
  experimentId: '',
};

export default function CreateNoteScreen() {
  const { projectId, experimentId, title } = useLocalSearchParams<{
    projectId?: string;
    experimentId?: string;
    title?: string;
  }>();
  const experiment = useAppSelector(selectExperimentById(experimentId ?? ''));
  const defaultTitle = title ?? (experiment ? `Notes on: ${experiment.title}` : '');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { watch, setValue, handleSubmit } = useForm<NoteFormValues>({
    defaultValues: {
      ...INITIAL_VALUES,
      title: defaultTitle,
      projectId: projectId ?? '',
      experimentId: experimentId ?? '',
    },
  });
  const values = watch();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Create Note</ThemedText>
        <NoteForm
          values={values}
          onChange={(patch) => {
            for (const [key, value] of Object.entries(patch)) {
              setValue(key as keyof NoteFormValues, value as never);
            }
          }}
          onAddCustomTag={(tag) => void dispatch(createCustomTagThunk(tag))}
          submitLabel="Save Note"
          onSubmit={handleSubmit((formValues) => {
            if (!formValues.title.trim()) return;
            void dispatch(
              createNoteThunk({
                title: formValues.title.trim(),
                body: formValues.body.trim(),
                projectId: formValues.projectId || null,
                experimentId: formValues.experimentId || null,
                tags: formValues.tags,
              }),
            );
            router.replace(ROUTES.notesList);
          })}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});
