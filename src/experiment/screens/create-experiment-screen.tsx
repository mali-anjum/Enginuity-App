import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { ExperimentForm, type ExperimentFormValues } from '@/experiment/components/experiment-form';
import { HardwarePickerSheet } from '@/experiment/components/hardware-picker-sheet';
import { createExperimentThunk } from '@/experiment/state/experimentSlice';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { selectProjectById } from '@/project/state/projectSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const INITIAL_VALUES: ExperimentFormValues = {
  title: '',
  projectId: '',
  objective: '',
  observations: '',
  githubCommit: '',
  status: 'pending',
  attachmentInput: '',
};

export default function CreateExperimentScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId?: string | string[] }>();
  const initialProjectId =
    typeof projectIdParam === 'string'
      ? projectIdParam
      : Array.isArray(projectIdParam)
        ? projectIdParam[0] ?? ''
        : '';
  const [values, setValues] = useState<ExperimentFormValues>({
    ...INITIAL_VALUES,
    projectId: initialProjectId,
  });
  const [selectedHardwareIds, setSelectedHardwareIds] = useState<string[]>([]);
  const [isHardwarePickerOpen, setIsHardwarePickerOpen] = useState(false);
  const hardwareItems = useAppSelector(selectAllHardware);
  const lockedProject = useAppSelector(selectProjectById(initialProjectId));
  const dispatch = useAppDispatch();
  const router = useRouter();

  const lockedProjectTitle = initialProjectId ? lockedProject?.title : undefined;

  const selectedHardwareChips = useMemo(() => {
    const map = new Map(hardwareItems.map((h) => [h.id, h]));
    return selectedHardwareIds
      .map((id) => map.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((h) => ({ id: h.id, name: h.name, category: h.category }));
  }, [hardwareItems, selectedHardwareIds]);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Create Experiment</ThemedText>
        <ExperimentForm
          values={values}
          selectedHardwareCount={selectedHardwareIds.length}
          selectedHardwareChips={selectedHardwareChips}
          lockedProjectTitle={lockedProjectTitle}
          onRemoveHardware={(hardwareId) =>
            setSelectedHardwareIds((prev) => prev.filter((id) => id !== hardwareId))
          }
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          onOpenHardwarePicker={() => setIsHardwarePickerOpen(true)}
          submitLabel="Save Experiment"
          onSubmit={() => {
            if (!values.title.trim() || !values.projectId) return;
            const attachmentUrls = values.attachmentInput.trim() ? [values.attachmentInput.trim()] : [];
            void (async () => {
              const created = await dispatch(
                createExperimentThunk({
                  title: values.title.trim(),
                  projectId: values.projectId,
                  objective: values.objective.trim(),
                  observations: values.observations.trim(),
                  githubCommit: values.githubCommit.trim(),
                  status: values.status,
                  hardwareIds: selectedHardwareIds,
                  attachmentUrls,
                }),
              ).unwrap();
              router.replace(`/experiment/${created.id}`);
            })();
          }}
        />
      </ScrollView>
      <HardwarePickerSheet
        isOpen={isHardwarePickerOpen}
        hardwareItems={hardwareItems}
        selectedHardwareIds={selectedHardwareIds}
        onToggle={(hardwareId) => {
          setSelectedHardwareIds((prev) =>
            prev.includes(hardwareId)
              ? prev.filter((id) => id !== hardwareId)
              : [...prev, hardwareId],
          );
        }}
        onClose={() => setIsHardwarePickerOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
});
