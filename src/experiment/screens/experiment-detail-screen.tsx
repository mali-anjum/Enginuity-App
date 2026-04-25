import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { TagChip } from '@/common/atoms/tag-chip';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { experimentStatusLabel, nextExperimentStatus } from '@/experiment/constants';
import type { ExperimentStatus } from '@/experiment/constants';
import { CsvPreviewChartSection } from '@/experiment/organisms/csv-preview-chart-section';
import {
  exportExperimentAsPdf,
  resolveProjectName,
} from '@/experiment/services/experimentPdfExportService';
import { selectExperimentById, updateExperimentThunk } from '@/experiment/state/experimentSlice';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { ProPaywallModal } from '@/monetization/organisms/pro-paywall-modal';
import {
  fetchSubscriptionStatusThunk,
  openCheckoutThunk,
  selectCanUseCsvCharts,
  selectCanUsePdfExport,
  selectIsCheckoutLoading,
} from '@/monetization/state/monetizationSlice';
import { selectNotesByExperiment } from '@/notes/state/notesSlice';
import { selectProjectById } from '@/project/state/projectSlice';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function statusChipColors(
  themeColors: (typeof Colors)['light'],
  status: ExperimentStatus,
): { border: string; background: string } {
  switch (status) {
    case 'pending':
      return { border: themeColors.border, background: themeColors.surfaceElevated };
    case 'in_progress':
      return { border: themeColors.primary, background: themeColors.heroTint };
    case 'completed':
      return { border: themeColors.accentBorder, background: themeColors.accentSoft };
    case 'failed':
      return { border: themeColors.danger, background: themeColors.surfaceElevated };
    default:
      return { border: themeColors.border, background: themeColors.surfaceElevated };
  }
}

function isImageAttachment(fileType: string | null, fileName: string): boolean {
  const type = fileType?.toLowerCase() ?? '';
  if (type.startsWith('image/')) return true;
  return /\.(png|jpe?g|webp|gif|bmp)$/i.test(fileName);
}

function isCsvAttachment(fileType: string | null, fileName: string): boolean {
  const type = fileType?.toLowerCase() ?? '';
  if (type.includes('csv') || type.includes('comma-separated-values')) return true;
  return /\.csv$/i.test(fileName);
}

function formatFileSize(size: number | null): string {
  if (!size || size <= 0) return 'Unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ExperimentDetailScreen() {
  const { experimentId } = useLocalSearchParams<{ experimentId: string }>();
  const experiment = useAppSelector(selectExperimentById(experimentId ?? ''));
  const hardwareItems = useAppSelector(selectAllHardware);
  const linkedNotes = useAppSelector(selectNotesByExperiment(experimentId ?? ''));
  const project = useAppSelector(selectProjectById(experiment?.projectId ?? ''));
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTitle, setPaywallTitle] = useState('Upgrade to Pro');
  const [paywallDescription, setPaywallDescription] = useState('');
  const canUsePdfExport = useAppSelector(selectCanUsePdfExport);
  const canUseCsvCharts = useAppSelector(selectCanUseCsvCharts);
  const isCheckoutLoading = useAppSelector(selectIsCheckoutLoading);

  if (!experiment) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Experiment not found.</ThemedText>
      </ThemedView>
    );
  }

  const linkedHardware = hardwareItems.filter((item) => experiment.hardwareIds.includes(item.id));
  const chipColors = statusChipColors(themeColors, experiment.status);
  const attachments = experiment.attachments ?? [];
  const imageAttachments = attachments.filter((item) =>
    isImageAttachment(item.fileType, item.fileName),
  );
  const fileAttachments = attachments.filter(
    (item) => !isImageAttachment(item.fileType, item.fileName),
  );
  const firstCsvAttachment = fileAttachments.find((item) =>
    isCsvAttachment(item.fileType, item.fileName),
  );
  const hardwareNames = linkedHardware.map((item) => item.name);

  const onSharePdf = async () => {
    if (isExportingPdf) return;
    if (!canUsePdfExport) {
      setPaywallTitle('PDF export is a Pro feature.');
      setPaywallDescription('Upgrade to Pro to export experiment reports as PDF.');
      setShowPaywall(true);
      return;
    }
    setIsExportingPdf(true);
    try {
      const pdfPath = await exportExperimentAsPdf({
        experiment,
        projectName: resolveProjectName(project),
        hardwareNames,
      });
      const shareUri = pdfPath.startsWith('file://') ? pdfPath : `file://${pdfPath}`;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
        });
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <ThemedText type="title">{experiment.title}</ThemedText>
          <View style={styles.topActions}>
            <Pressable onPress={() => void onSharePdf()}>
              <ThemedText style={{ color: themeColors.primary }}>
                {isExportingPdf ? 'Preparing…' : 'Share'}
              </ThemedText>
            </Pressable>
            <Link href={ROUTE_PATHS.EXPERIMENT_EDIT(experiment.id)}>
              <ThemedText style={{ color: themeColors.primary }}>Edit</ThemedText>
            </Link>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityHint="Cycles Pending, In Progress, Completed, Failed"
          onPress={() => {
            void dispatch(
              updateExperimentThunk({
                ...experiment,
                status: nextExperimentStatus(experiment.status),
              }),
            );
          }}
          style={[
            styles.statusChip,
            { borderColor: chipColors.border, backgroundColor: chipColors.background },
          ]}>
          <ThemedText type="defaultSemiBold">{experimentStatusLabel(experiment.status)}</ThemedText>
          <ThemedText style={[styles.statusHint, { color: themeColors.mutedText }]}>
            Tap to update status
          </ThemedText>
        </Pressable>

        <ThemedText style={{ color: themeColors.mutedText, fontSize: 13 }}>
          Logged {new Date(experiment.createdAt).toLocaleString()}
          {experiment.updatedAt !== experiment.createdAt
            ? ` · Updated ${new Date(experiment.updatedAt).toLocaleString()}`
            : ''}
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Objective</ThemedText>
          <ThemedText>{experiment.objective.trim() ? experiment.objective : '—'}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Tags</ThemedText>
          {experiment.tags.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No tags.</ThemedText>
          ) : (
            <View style={styles.chipWrap}>
              {experiment.tags.map((tag) => (
                <TagChip key={tag} label={tag} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Observations</ThemedText>
          <ThemedText>{experiment.observations.trim() ? experiment.observations : '—'}</ThemedText>
          <View style={styles.notesRow}>
            <View style={styles.topRow}>
              <ThemedText type="defaultSemiBold">Linked notes</ThemedText>
              <Link href={ROUTE_PATHS.NOTES_CREATE_FOR_EXPERIMENT(experiment.id)}>
                <ThemedText style={{ color: themeColors.primary }}>Add note</ThemedText>
              </Link>
            </View>
            {linkedNotes.length === 0 ? (
              <ThemedText style={{ color: themeColors.mutedText }}>
                No notes linked to this experiment yet.
              </ThemedText>
            ) : (
              linkedNotes.map((note) => (
                <Link key={note.id} href={ROUTE_PATHS.NOTE_DETAIL(note.id)} asChild>
                  <Pressable
                    style={[
                      styles.noteCard,
                      {
                        borderColor: themeColors.border,
                        backgroundColor: themeColors.surfaceElevated,
                      },
                    ]}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                      {note.title}
                    </ThemedText>
                    <ThemedText style={[styles.chipMeta, { color: themeColors.mutedText }]} numberOfLines={2}>
                      {note.body || 'No note body.'}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">GitHub commit</ThemedText>
          <ThemedText selectable>
            {experiment.githubCommit.trim() ? experiment.githubCommit : '—'}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Hardware</ThemedText>
          {linkedHardware.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No hardware linked.</ThemedText>
          ) : (
            <View style={styles.chipWrap}>
              {linkedHardware.map((hardware) => (
                <Link key={hardware.id} href={ROUTE_PATHS.HARDWARE_DETAIL(hardware.id)} asChild>
                  <Pressable
                    style={[
                      styles.hardwareChip,
                      {
                        borderColor: themeColors.primary,
                        backgroundColor: themeColors.heroTint,
                      },
                    ]}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                      {hardware.name}
                    </ThemedText>
                    <ThemedText style={[styles.chipMeta, { color: themeColors.mutedText }]}>
                      {hardware.category}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Photos</ThemedText>
          {imageAttachments.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No attachments uploaded.</ThemedText>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStrip}>
              {imageAttachments.map((attachment) => (
                <Link
                  key={attachment.url}
                  href={ROUTE_PATHS.EXPERIMENT_ATTACHMENT_VIEWER(
                    attachment.url,
                    attachment.fileName,
                    attachment.fileType ?? 'image/*',
                  )}
                  asChild>
                  <Pressable
                    style={[
                      styles.photoCard,
                      {
                        borderColor: themeColors.border,
                        backgroundColor: themeColors.surfaceElevated,
                      },
                    ]}>
                    <Image source={{ uri: attachment.url }} style={styles.photoThumb} contentFit="cover" />
                  </Pressable>
                </Link>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Attached files</ThemedText>
          {fileAttachments.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No CSV/PDF files attached.</ThemedText>
          ) : (
            fileAttachments.map((attachment) => (
              <Link
                key={attachment.url}
                href={ROUTE_PATHS.EXPERIMENT_ATTACHMENT_VIEWER(
                  attachment.url,
                  attachment.fileName,
                  attachment.fileType ??
                    (isCsvAttachment(attachment.fileType, attachment.fileName)
                      ? 'text/csv'
                      : 'application/pdf'),
                )}
                asChild>
                <Pressable
                  style={[
                    styles.fileCard,
                    { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                  ]}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1}>
                    {attachment.fileName}
                  </ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>
                    {formatFileSize(attachment.fileSize)} · Uploaded{' '}
                    {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </ThemedText>
                  <ThemedText style={{ color: themeColors.primary }}>Open attachment</ThemedText>
                </Pressable>
              </Link>
            ))
          )}
        </View>

        {firstCsvAttachment ? (
          <View style={styles.section}>
            {canUseCsvCharts ? (
              <CsvPreviewChartSection
                csvUrl={firstCsvAttachment.url}
                csvName={firstCsvAttachment.fileName}
              />
            ) : (
              <View
                style={[
                  styles.fileCard,
                  { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                ]}>
                <ThemedText type="defaultSemiBold">CSV charts are a Pro feature.</ThemedText>
                <ThemedText style={{ color: themeColors.mutedText }}>
                  Upgrade to Pro to visualize attached CSV data with interactive charts.
                </ThemedText>
                <Pressable
                  onPress={() => {
                    setPaywallTitle('CSV charts are a Pro feature.');
                    setPaywallDescription('Upgrade to Pro for full chart visualization tools.');
                    setShowPaywall(true);
                  }}>
                  <ThemedText style={{ color: themeColors.primary }}>Upgrade to Pro</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Quick Actions</ThemedText>
          <Link
            href={ROUTE_PATHS.NOTES_CREATE_FOR_EXPERIMENT_WITH_TITLE(
              experiment.id,
              `Notes on: ${experiment.title}`,
            )}
            asChild>
            <Pressable style={[styles.quickActionButton, { backgroundColor: themeColors.primary }]}>
              <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
                Add Note
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
      <ProPaywallModal
        visible={showPaywall}
        title={paywallTitle}
        description={paywallDescription}
        isUpgradeLoading={isCheckoutLoading}
        onClose={() => setShowPaywall(false)}
        onViewPlans={() => router.push(ROUTES.SETTINGS_UPGRADE)}
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusChip: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  statusHint: { fontSize: 11 },
  section: { gap: 8 },
  notesRow: { gap: 8, marginTop: 6 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hardwareChip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  chipMeta: { fontSize: 12 },
  noteCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  photoStrip: { gap: 10, paddingRight: 8 },
  photoCard: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  photoThumb: { width: 128, height: 96 },
  fileCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  quickActionButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
