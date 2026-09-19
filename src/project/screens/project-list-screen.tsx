import { Link, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { SkeletonShimmer } from '@/common/atoms/skeleton-shimmer';
import { Colors, Radii, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ListEmptyState } from '@/common/organisms/list-empty-state';
import {
  selectFilteredProjects,
  selectProjectFilter,
  setProjectFilter,
} from '@/project/state/projectSlice';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const FILTERS = ['active', 'completed', 'archived', 'favourites'] as const;

export default function ProjectListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectFilteredProjects);
  const activeFilter = useAppSelector(selectProjectFilter);
  const isLoading = useAppSelector((state) => state.project.isLoading);

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Project List</ThemedText>
          <Link href={ROUTES.PROJECT_CREATE as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Create Project</ThemedText>
          </Link>
        </View>
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const active = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => dispatch(setProjectFilter(filter))}
                style={[
                  styles.filterChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{filter}</ThemedText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.list}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <View
                key={`project-skeleton-${index}`}
                style={[
                  styles.card,
                  { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                ]}>
                <SkeletonShimmer style={styles.projectTitleSkeleton} />
                <SkeletonShimmer style={styles.projectLineSkeleton} />
                <SkeletonShimmer style={styles.projectLineShortSkeleton} />
              </View>
            ))
          ) : projects.length === 0 ? (
            <ListEmptyState
              icon="folder.badge.plus"
              headline="Your first project is one tap away"
              body="Organise your engineering work and track experiments in one place."
              ctaLabel="Create Project"
              onPressCta={() => router.push(ROUTES.PROJECT_CREATE as Href)}
            />
          ) : (
            projects.map((project) => (
              <Link key={project.id} href={ROUTE_PATHS.PROJECT_DETAIL(project.id)} asChild>
                <Pressable
                  style={[
                    styles.card,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.surfaceElevated,
                      shadowColor: themeColors.cardShadow,
                    },
                  ]}>
                  <ThemedText type="defaultSemiBold">{project.title}</ThemedText>
                  {project.sharedWithMe ? (
                    <View
                      style={[
                        styles.sharedBadge,
                        { borderColor: themeColors.accentBorder, backgroundColor: themeColors.accentSoft },
                      ]}>
                      <ThemedText type="caption" style={{ fontWeight: '600' }}>Shared with me</ThemedText>
                    </View>
                  ) : null}
                  <ThemedText style={{ color: themeColors.mutedText }} numberOfLines={2}>
                    {project.description || 'No description'}
                  </ThemedText>
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
  content: { padding: Spacing.lg, gap: Spacing.md + 2, paddingBottom: Spacing.xxxl + Spacing.sm },
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
  sharedBadge: {
    borderWidth: 1,
    borderRadius: Radii.md,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 1,
  },
  projectTitleSkeleton: { height: 16, borderRadius: 6, width: '62%', marginBottom: 4 },
  projectLineSkeleton: { height: 12, borderRadius: 6, width: '95%' },
  projectLineShortSkeleton: { height: 12, borderRadius: 6, width: '74%', marginTop: 4 },
});
