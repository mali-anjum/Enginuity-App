import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { ProjectForm, type ProjectFormValues } from '@/project/organisms/project-form';
import { selectProjectById, updateProjectThunk } from '@/project/state/projectSlice';
import { ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function EditProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const project = useAppSelector(selectProjectById(projectId ?? ''));

  const initialValues = useMemo<ProjectFormValues>(
    () => ({
      title: project?.title ?? '',
      description: project?.description ?? '',
      startDate: project?.startDate ?? '',
      dueDate: project?.dueDate ?? '',
      status: project?.status ?? 'active',
    }),
    [project],
  );
  const [values, setValues] = useState<ProjectFormValues>(initialValues);

  if (!project) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Project not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Edit Project</ThemedText>
        <ProjectForm
          values={values}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          submitLabel="Update Project"
          onSubmit={() => {
            if (!values.title.trim()) return;
            void dispatch(
              updateProjectThunk({
                ...project,
                title: values.title.trim(),
                description: values.description.trim(),
                startDate: values.startDate.trim() || null,
                dueDate: values.dueDate.trim() || null,
                status: values.status,
                isCompleted: values.status === 'completed',
              }),
            );
            router.replace(ROUTE_PATHS.PROJECT_DETAIL(project.id));
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },
  content: { gap: 14, paddingBottom: 40 },
});
