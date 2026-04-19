import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { ExperimentForm, type ExperimentFormValues } from '@/experiment/components/experiment-form';
import { HardwarePickerSheet } from '@/experiment/components/hardware-picker-sheet';
import { createExperimentThunk } from '@/experiment/state/experimentSlice';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const INITIAL_VALUES: ExperimentFormValues = {
  title: '',
  projectId: '',
  codeRef: '',
  notes: '',
  status: 'draft',
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
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Create Experiment</ThemedText>
        <ExperimentForm
          values={values}
          selectedHardwareCount={selectedHardwareIds.length}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          onOpenHardwarePicker={() => setIsHardwarePickerOpen(true)}
          submitLabel="Save Experiment"
          onSubmit={() => {
            if (!values.title.trim() || !values.projectId) return;
            const attachmentUrls = values.attachmentInput.trim() ? [values.attachmentInput.trim()] : [];
            void dispatch(
              createExperimentThunk({
                title: values.title.trim(),
                projectId: values.projectId,
                codeRef: values.codeRef.trim(),
                notes: values.notes.trim(),
                status: values.status,
                hardwareIds: selectedHardwareIds,
                attachmentUrls,
              }),
            );
            router.replace('/experiment');
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
