import { ScrollView, StyleSheet, View } from 'react-native';

import { selectAllExperiments } from '@/experiment/state/experimentSlice';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { selectAllNotes } from '@/notes/state/notesSlice';
import { selectAllProjects } from '@/project/state/projectSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/auth/state/authSlice';

export default function AccountStatisticsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const projects = useAppSelector(selectAllProjects);
  const experiments = useAppSelector(selectAllExperiments);
  const notes = useAppSelector(selectAllNotes);
  const hardware = useAppSelector(selectAllHardware);
  const user = useAppSelector(selectUser);

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Account Statistics</ThemedText>

        <StatCard label="Total Projects" value={projects.length} />
        <StatCard label="Total Experiments" value={experiments.length} />
        <StatCard label="Total Notes" value={notes.length} />
        <StatCard label="Total Hardware Items" value={hardware.length} />
        <StatCard label="Storage Used (MB)" value={Number((user?.storageUsedMb ?? 0).toFixed(2))} />

        <View style={[styles.smallCard, { borderColor: themeColors.border }]}>
          <ThemedText type="defaultSemiBold">Activity breakdown</ThemedText>
          <ThemedText style={{ color: themeColors.mutedText }}>
            Completed projects: {projects.filter((project) => project.status === 'completed').length}
          </ThemedText>
          <ThemedText style={{ color: themeColors.mutedText }}>
            In-progress experiments:{' '}
            {experiments.filter((experiment) => experiment.status === 'in_progress').length}
          </ThemedText>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  return (
    <View style={[styles.statCard, { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated }]}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <ThemedText type="title">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  statCard: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 3 },
  smallCard: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 3 },
});
