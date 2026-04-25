import { Link, useLocalSearchParams, type Href } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllExperiments } from '@/experiment/state/experimentSlice';
import { deleteHardwareThunk, selectHardwareById } from '@/hardware/state/hardwareSlice';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function HardwareDetailScreen() {
  const { hardwareId } = useLocalSearchParams<{ hardwareId: string }>();
  const hardware = useAppSelector(selectHardwareById(hardwareId ?? ''));
  const experiments = useAppSelector(selectAllExperiments);
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!hardware) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Hardware item not found.</ThemedText>
      </ThemedView>
    );
  }

  const usedByExperiments = experiments.filter((exp) => exp.hardwareIds.includes(hardware.id));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText type="title">{hardware.name}</ThemedText>
          <Link href={ROUTE_PATHS.HARDWARE_EDIT(hardware.id)}>
            <ThemedText style={{ color: themeColors.primary }}>Edit</ThemedText>
          </Link>
        </View>

        <ThemedText style={{ color: themeColors.mutedText }}>{hardware.category}</ThemedText>
        <ThemedText>{hardware.specs || 'No specs added.'}</ThemedText>
        <ThemedText style={{ color: themeColors.subtleText }}>
          Datasheet: {hardware.datasheetUrl || 'Not provided'}
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Used in Experiments</ThemedText>
          {usedByExperiments.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>Not used in any experiments yet.</ThemedText>
          ) : (
            usedByExperiments.map((exp) => (
              <Link key={exp.id} href={ROUTE_PATHS.EXPERIMENT_DETAIL(exp.id)}>
                <ThemedText style={{ color: themeColors.primary }}>{exp.title}</ThemedText>
              </Link>
            ))
          )}
        </View>

        <Pressable
          style={[styles.deleteButton, { borderColor: themeColors.danger }]}
          onPress={() => setIsDeleteDialogOpen(true)}>
          <ThemedText style={{ color: themeColors.danger }}>Delete Hardware</ThemedText>
        </Pressable>
      </ScrollView>

      <Modal animationType="fade" transparent visible={isDeleteDialogOpen}>
        <View style={styles.dialogOverlay}>
          <ThemedView
            style={[
              styles.dialogCard,
              { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
            ]}>
            <ThemedText type="subtitle">Delete this hardware?</ThemedText>
            <ThemedText style={{ color: themeColors.mutedText }}>
              This action cannot be undone.
            </ThemedText>
            <View style={styles.dialogActions}>
              <Pressable
                style={[styles.dialogButton, { borderColor: themeColors.border }]}
                onPress={() => setIsDeleteDialogOpen(false)}>
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Link href={ROUTES.HARDWARE_LIST as Href} asChild>
                <Pressable
                  style={[styles.dialogButton, { borderColor: themeColors.danger }]}
                  onPress={() => {
                    void dispatch(deleteHardwareThunk(hardware.id));
                    setIsDeleteDialogOpen(false);
                  }}>
                  <ThemedText style={{ color: themeColors.danger }}>Delete</ThemedText>
                </Pressable>
              </Link>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { marginTop: 6, gap: 6 },
  deleteButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  dialogButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
});
