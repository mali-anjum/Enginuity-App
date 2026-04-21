import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { ExperimentForm, type ExperimentFormValues } from '@/experiment/organisms/experiment-form';
import { HardwarePickerSheet } from '@/experiment/organisms/hardware-picker-sheet';
import {
  selectExperimentById,
  updateExperimentThunk,
  uploadAttachmentThunk,
} from '@/experiment/state/experimentSlice';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function EditExperimentScreen() {
  const { experimentId } = useLocalSearchParams<{ experimentId: string }>();
  const experiment = useAppSelector(selectExperimentById(experimentId ?? ''));
  const hardwareItems = useAppSelector(selectAllHardware);
  const [isHardwarePickerOpen, setIsHardwarePickerOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const initialValues = useMemo<ExperimentFormValues>(
    () => ({
      title: experiment?.title ?? '',
      projectId: experiment?.projectId ?? '',
      objective: experiment?.objective ?? '',
      observations: experiment?.observations ?? '',
      githubCommit: experiment?.githubCommit ?? '',
      status: experiment?.status ?? 'pending',
      tagsInput: experiment?.tags.join(', ') ?? '',
    }),
    [experiment],
  );
  const [values, setValues] = useState<ExperimentFormValues>(initialValues);
  const [selectedHardwareIds, setSelectedHardwareIds] = useState<string[]>(experiment?.hardwareIds ?? []);
  const [pendingPhotoUris, setPendingPhotoUris] = useState<string[]>([]);
  const [pendingFileAssets, setPendingFileAssets] = useState<
    Array<{ uri: string; name: string; mimeType: string | null; size: number | null }>
  >([]);

  const selectedHardwareChips = useMemo(() => {
    const map = new Map(hardwareItems.map((h) => [h.id, h]));
    return selectedHardwareIds
      .map((id) => map.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((h) => ({ id: h.id, name: h.name, category: h.category }));
  }, [hardwareItems, selectedHardwareIds]);

  if (!experiment) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Experiment not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Edit Experiment</ThemedText>
        <ExperimentForm
          values={values}
          selectedHardwareCount={selectedHardwareIds.length}
          selectedHardwareChips={selectedHardwareChips}
          onRemoveHardware={(hardwareId) =>
            setSelectedHardwareIds((prev) => prev.filter((id) => id !== hardwareId))
          }
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          onOpenHardwarePicker={() => setIsHardwarePickerOpen(true)}
          onAddPhoto={() => {
            void (async () => {
              const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permission.granted) return;
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.85,
              });
              if (result.canceled || !result.assets[0]?.uri) return;
              setPendingPhotoUris((prev) => [...prev, result.assets[0].uri]);
            })();
          }}
          onAttachFile={() => {
            void (async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'application/pdf', 'text/comma-separated-values', '.csv', '.pdf'],
                multiple: false,
                copyToCacheDirectory: true,
              });
              if (result.canceled || !result.assets[0]) return;
              const asset = result.assets[0];
              setPendingFileAssets((prev) => [
                ...prev,
                {
                  uri: asset.uri,
                  name: asset.name,
                  mimeType: asset.mimeType ?? null,
                  size: asset.size ?? null,
                },
              ]);
            })();
          }}
          attachmentPreviewUrls={[...experiment.attachmentUrls, ...pendingPhotoUris]}
          fileAttachmentCount={
            (experiment.attachments ?? []).filter((item) => {
              const type = item.fileType?.toLowerCase() ?? '';
              return type.includes('csv') || type.includes('pdf');
            }).length + pendingFileAssets.length
          }
          submitLabel="Update Experiment"
          onSubmit={() => {
            if (!values.title.trim() || !values.projectId) return;
            void (async () => {
              await dispatch(
                updateExperimentThunk({
                  ...experiment,
                  title: values.title.trim(),
                  projectId: values.projectId,
                  objective: values.objective.trim(),
                  observations: values.observations.trim(),
                  githubCommit: values.githubCommit.trim(),
                  status: values.status,
                  hardwareIds: selectedHardwareIds,
                  attachmentUrls: experiment.attachmentUrls,
                  attachments: experiment.attachments ?? [],
                  tags: values.tagsInput
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }),
              ).unwrap();
              for (const uri of pendingPhotoUris) {
                await dispatch(
                  uploadAttachmentThunk({
                    experimentId: experiment.id,
                    localUri: uri,
                    fileType: 'image/jpeg',
                  }),
                ).unwrap();
              }
              for (const file of pendingFileAssets) {
                await dispatch(
                  uploadAttachmentThunk({
                    experimentId: experiment.id,
                    localUri: file.uri,
                    fileName: file.name,
                    fileType: file.mimeType,
                    fileSize: file.size,
                  }),
                ).unwrap();
              }
              router.replace(`/experiment/${experiment.id}`);
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
  screen: { flex: 1, padding: 16 },
  content: { gap: 14, paddingBottom: 40 },
});
