import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { ProjectForm, type ProjectFormValues } from '@/project/components/project-form';
import { createProjectThunk } from '@/project/state/projectSlice';
import { useAppDispatch } from '@/sharedModules/state/hooks';

const INITIAL_VALUES: ProjectFormValues = {
  title: '',
  description: '',
  startDate: '',
  dueDate: '',
  status: 'active',
};

export default function CreateProjectScreen() {
  const [values, setValues] = useState<ProjectFormValues>(INITIAL_VALUES);
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Create Project</ThemedText>
        <ProjectForm
          values={values}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          submitLabel="Save Project"
          onSubmit={() => {
            if (!values.title.trim()) return;
            void (async () => {
              const created = await dispatch(
                createProjectThunk({
                  title: values.title.trim(),
                  description: values.description.trim(),
                  startDate: values.startDate.trim() || null,
                  dueDate: values.dueDate.trim() || null,
                  status: values.status,
                }),
              ).unwrap();
              router.replace(`/project/${created.id}`);
            })();
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
});
