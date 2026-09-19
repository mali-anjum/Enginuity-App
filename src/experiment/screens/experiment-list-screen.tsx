import { Link, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { SkeletonShimmer } from '@/common/atoms/skeleton-shimmer';
import { TagChip } from '@/common/atoms/tag-chip';
import { Colors, Radii, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ListEmptyState } from '@/common/organisms/list-empty-state';
import { EXPERIMENT_STATUSES, experimentStatusLabel } from '@/experiment/constants';
import {
  selectAllExperiments,
  setExperimentStatusFilter,
} from '@/experiment/state/experimentSlice';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function ExperimentListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const experiments = useAppSelector(selectAllExperiments);
  const activeStatus = useAppSelector((state) => state.experiment.filterByStatus);
  const isLoading = useAppSelector((state) => state.experiment.isLoading);

  const filtered = activeStatus
    ? experiments.filter((experiment) => experiment.status === activeStatus)
    : experiments;

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Experiment List</ThemedText>
          <Link href={ROUTES.EXPERIMENT_CREATE as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Create Experiment</ThemedText>
          </Link>
        </View>

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => dispatch(setExperimentStatusFilter(null))}
            style={[
              styles.filterChip,
              {
                borderColor: activeStatus === null ? themeColors.primary : themeColors.border,
                backgroundColor: activeStatus === null ? themeColors.heroTint : themeColors.background,
              },
            ]}>
            <ThemedText>All</ThemedText>
          </Pressable>
          {EXPERIMENT_STATUSES.map((status) => {
            const active = activeStatus === status;
            return (
              <Pressable
                key={status}
                onPress={() => dispatch(setExperimentStatusFilter(status))}
                style={[
                  styles.filterChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{experimentStatusLabel(status)}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.list}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <View
                key={`experiment-skeleton-${index}`}
                style={[
                  styles.card,
                  { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                ]}>
                <SkeletonShimmer style={styles.experimentTitleSkeleton} />
                <View style={styles.skeletonStatusRow}>
                  <View style={[styles.statusOutlineSkeleton, { borderColor: themeColors.border }]} />
                  <SkeletonShimmer style={styles.experimentLineSkeleton} />
                </View>
                <View style={styles.skeletonChipRow}>
                  <SkeletonShimmer style={styles.tagSkeleton} />
                  <SkeletonShimmer style={styles.tagSkeleton} />
                  <SkeletonShimmer style={styles.tagSkeleton} />
                </View>
              </View>
            ))
          ) : filtered.length === 0 ? (
            <ListEmptyState
              icon="flask.fill"
              headline="Run your first experiment"
              body="Track objectives, observations, attachments, and status in one structured engineering log."
              ctaLabel="Create Experiment"
              onPressCta={() => router.push(ROUTES.EXPERIMENT_CREATE as Href)}
            />
          ) : (
            filtered.map((experiment) => (
              <Link key={experiment.id} href={ROUTE_PATHS.EXPERIMENT_DETAIL(experiment.id)} asChild>
                <Pressable
                  style={[
                    styles.card,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.surfaceElevated,
                      shadowColor: themeColors.cardShadow,
                    },
                  ]}>
                  <ThemedText type="defaultSemiBold">{experiment.title}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>
                    {experimentStatusLabel(experiment.status)}
                  </ThemedText>
                  {experiment.tags.length > 0 ? (
                    <View style={styles.tagRow}>
                      {experiment.tags.slice(0, 4).map((tag) => (
                        <TagChip key={`${experiment.id}-${tag}`} label={tag} />
                      ))}
                    </View>
                  ) : null}
                </Pressable>
              </Link>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  filterChip: { borderWidth: 1, borderRadius: Radii.full, paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 2 },
  list: { gap: Spacing.sm + 2 },
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  skeletonStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  statusOutlineSkeleton: { width: 70, height: 24, borderWidth: 1, borderRadius: 12 },
  skeletonChipRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  experimentTitleSkeleton: { height: 16, borderRadius: 6, width: '66%' },
  experimentLineSkeleton: { height: 12, borderRadius: 6, width: '45%' },
  tagSkeleton: { height: 22, borderRadius: 11, width: 58 },
});
