import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ProPaywallModal } from '@/monetization/organisms/pro-paywall-modal';
import {
  fetchSubscriptionStatusThunk,
  openCheckoutThunk,
  selectCanCreateExperiment,
  selectCanUseStorage,
  selectIsCheckoutLoading,
} from '@/monetization/state/monetizationSlice';
import { ExperimentForm, type ExperimentFormValues } from '@/experiment/organisms/experiment-form';
import { HardwarePickerSheet } from '@/experiment/organisms/hardware-picker-sheet';
import { createExperimentThunk, uploadAttachmentThunk } from '@/experiment/state/experimentSlice';
import { EXPERIMENT_TEMPLATES } from '@/experiment/utils/experimentTemplates';
import { optimizeImageForUpload } from '@/experiment/utils/imageUploadOptimizer';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { selectProjectById } from '@/project/state/projectSlice';
import { ROUTES, routePaths } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const INITIAL_VALUES: ExperimentFormValues = {
  title: '',
  projectId: '',
  objective: '',
  observations: '',
  githubCommit: '',
  status: 'pending',
  tagsInput: '',
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
  const [pendingPhotoUris, setPendingPhotoUris] = useState<string[]>([]);
  const [pendingFileAssets, setPendingFileAssets] = useState<
    { uri: string; name: string; mimeType: string | null; size: number | null }[]
  >([]);
  const [isHardwarePickerOpen, setIsHardwarePickerOpen] = useState(false);
  const hardwareItems = useAppSelector(selectAllHardware);
  const lockedProject = useAppSelector(selectProjectById(initialProjectId));
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTitle, setPaywallTitle] = useState("You've reached the free tier limit.");
  const [paywallDescription, setPaywallDescription] = useState(
    'Upgrade to Pro for unlimited access.',
  );
  const canCreateExperiment = useAppSelector(selectCanCreateExperiment);
  const canUseStorage = useAppSelector(selectCanUseStorage);
  const isCheckoutLoading = useAppSelector(selectIsCheckoutLoading);

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
        <View style={styles.templateSection}>
          <View style={styles.templateHeader}>
            <ThemedText type="defaultSemiBold">Use Template</ThemedText>
            {selectedTemplateId ? (
              <Pressable
                onPress={() => setSelectedTemplateId(null)}
                style={[
                  styles.clearTemplateButton,
                  { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                ]}>
                <ThemedText style={{ color: themeColors.mutedText }}>Clear</ThemedText>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.templateWrap}>
            {EXPERIMENT_TEMPLATES.map((template) => {
              const selected = selectedTemplateId === template.id;
              return (
                <Pressable
                  key={template.id}
                  onPress={() => {
                    setSelectedTemplateId(template.id);
                    setValues((prev) => ({
                      ...prev,
                      title: prev.title.trim() ? prev.title : template.defaultTitle,
                      objective: template.objective,
                      observations: template.observations,
                    }));
                  }}
                  style={[
                    styles.templateChip,
                    {
                      borderColor: selected ? themeColors.primary : themeColors.border,
                      backgroundColor: selected ? themeColors.heroTint : themeColors.surfaceElevated,
                    },
                  ]}>
                  <ThemedText>{template.name}</ThemedText>
                </Pressable>
              );
            })}
          </View>
          <ThemedText style={{ color: themeColors.mutedText, fontSize: 12 }}>
            Templates are pre-built locally for faster engineering logs.
          </ThemedText>
        </View>
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
          onAddPhoto={() => {
            void (async () => {
              const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permission.granted) return;
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.85,
              });
              if (result.canceled || !result.assets[0]?.uri) return;
              try {
                const optimizedUri = await optimizeImageForUpload(result.assets[0].uri);
                setPendingPhotoUris((prev) => [...prev, optimizedUri]);
              } catch {
                setPendingPhotoUris((prev) => [...prev, result.assets[0].uri]);
              }
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
          attachmentPreviewUrls={pendingPhotoUris}
          fileAttachmentCount={pendingFileAssets.length}
          submitLabel="Save Experiment"
          onSubmit={() => {
            if (!values.title.trim() || !values.projectId) return;
            if (!canCreateExperiment) {
              setPaywallTitle("You've reached 20 experiments.");
              setPaywallDescription('Upgrade to Pro for unlimited experiments.');
              setShowPaywall(true);
              return;
            }
            if (!canUseStorage) {
              setPaywallTitle("You've reached 100MB storage.");
              setPaywallDescription('Upgrade to Pro for unlimited storage.');
              setShowPaywall(true);
              return;
            }
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
                  attachmentUrls: [],
                  tags: values.tagsInput
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }),
              ).unwrap();
              for (const uri of pendingPhotoUris) {
                await dispatch(
                  uploadAttachmentThunk({
                    experimentId: created.id,
                    localUri: uri,
                    fileType: 'image/jpeg',
                  }),
                ).unwrap();
              }
              for (const file of pendingFileAssets) {
                await dispatch(
                  uploadAttachmentThunk({
                    experimentId: created.id,
                    localUri: file.uri,
                    fileName: file.name,
                    fileType: file.mimeType,
                    fileSize: file.size,
                  }),
                ).unwrap();
              }
              router.replace(routePaths.experimentDetail(created.id));
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
      <ProPaywallModal
        visible={showPaywall}
        title={paywallTitle}
        description={paywallDescription}
        isUpgradeLoading={isCheckoutLoading}
        onClose={() => setShowPaywall(false)}
        onViewPlans={() => router.push(ROUTES.settingsUpgrade)}
        onUpgrade={() => {
          void (async () => {
            await dispatch(openCheckoutThunk());
            await dispatch(fetchSubscriptionStatusThunk());
          })();
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  templateSection: { gap: 8 },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  templateWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  templateChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  clearTemplateButton: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
});
