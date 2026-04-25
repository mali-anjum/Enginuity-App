import { Image } from 'expo-image';
import { Link, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import {
  selectHomeProjectSections,
  selectRecentExperimentsForHome,
} from '@/dashboard/selectors/home-dashboard';
import { selectActivityFeedItems, selectActivityFeedLoading } from '@/dashboard/state/activityFeedSlice';
import { HomeEmptyProjects } from '@/dashboard/organisms/home-empty-projects';
import type { Project } from '@/project/state/projectSlice';
import { selectProjectStats } from '@/project/state/projectSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { IconSymbol } from '@/sharedModules/ui/atoms/icon-symbol';
import { useAppSelector } from '@/sharedModules/state/hooks';

import { HomeFabCreateSheet } from '../organisms/home-fab-create-sheet';
import { HomeQuickSearchOverlay } from '../organisms/home-quick-search-overlay';
import { HomeFabGuidanceTooltip } from '../molecules/home-fab-guidance-tooltip';

function formatProjectStatusLabel(status: Project['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatRelativeTime(dateIso: string): string {
  const target = new Date(dateIso).getTime();
  if (Number.isNaN(target)) return 'just now';
  const diffMs = Date.now() - target;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateIso).toLocaleDateString();
}

function iconForActivity(eventType: string): Parameters<typeof IconSymbol>[0]['name'] {
  switch (eventType) {
    case 'experiment_created':
      return 'sparkles';
    case 'experiment_status_changed':
      return 'checkmark.circle.fill';
    case 'note_added':
      return 'paperplane.fill';
    case 'hardware_added':
      return 'bolt.fill';
    default:
      return 'chevron.right';
  }
}

function linkForActivity(entityType: string, entityId: string | null): Href | null {
  if (!entityId) return null;
  if (entityType === 'experiment') return ROUTE_PATHS.EXPERIMENT_DETAIL(entityId);
  if (entityType === 'note') return ROUTE_PATHS.NOTE_DETAIL(entityId);
  if (entityType === 'hardware') return ROUTE_PATHS.HARDWARE_DETAIL(entityId);
  if (entityType === 'project') return ROUTE_PATHS.PROJECT_DETAIL(entityId);
  return null;
}

function projectChipColors(
  theme: (typeof Colors)['light'],
  status: Project['status'],
): { border: string; background: string } {
  switch (status) {
    case 'active':
      return { border: theme.primary, background: theme.heroTint };
    case 'completed':
      return { border: theme.accentBorder, background: theme.accentSoft };
    case 'archived':
      return { border: theme.border, background: theme.surfaceElevated };
    default:
      return { border: theme.border, background: theme.surfaceElevated };
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { myProjects, sharedProjects } = useAppSelector(selectHomeProjectSections);
  const recentRows = useAppSelector(selectRecentExperimentsForHome);
  const activityFeed = useAppSelector(selectActivityFeedItems);
  const isActivityLoading = useAppSelector(selectActivityFeedLoading);
  const projectStats = useAppSelector(selectProjectStats);
  const hasCompletedOnboarding = useAppSelector((state) => state.onboarding.hasCompletedOnboarding);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const projectMatches = [...myProjects, ...sharedProjects]
      .filter((project) => project.title.toLowerCase().includes(normalizedQuery))
      .map((project) => ({
        id: `project-${project.id}`,
        title: project.title,
        subtitle: 'Project',
      }));

    const experimentMatches = recentRows
      .filter((row) =>
        row.experiment.title.toLowerCase().includes(normalizedQuery),
      )
      .map((row) => ({
        id: `experiment-${row.experiment.id}`,
        title: row.experiment.title,
        subtitle: 'Experiment',
      }));

    return [...projectMatches, ...experimentMatches].slice(0, 8);
  }, [searchQuery, myProjects, sharedProjects, recentRows]);

  const openCreateProject = () => {
    setIsCreateSheetOpen(false);
    router.push(ROUTES.PROJECT_CREATE);
  };

  const openCreateExperimentForRecentProject = () => {
    const target = myProjects[0] ?? sharedProjects[0];
    if (!target) {
      setIsCreateSheetOpen(false);
      return;
    }
    setIsCreateSheetOpen(false);
    router.push(ROUTE_PATHS.EXPERIMENT_CREATE_FOR_PROJECT(target.id));
  };

  const fabTooltipMessage = useMemo(() => {
    if (!hasCompletedOnboarding) return null;
    if (projectStats.total === 0) return 'Create your first project here.';
    if (recentRows.length === 0) return 'Add an experiment to your project.';
    return null;
  }, [hasCompletedOnboarding, projectStats.total, recentRows.length]);

  return (
    <ThemedView style={styles.screen}>
      <View
        style={[
          styles.header,
          { borderColor: themeColors.border, backgroundColor: themeColors.surface },
        ]}>
        <View style={styles.headerMain}>
          <ThemedText type="title">Home</ThemedText>
          <ThemedText style={{ color: themeColors.mutedText }}>
            {projectStats.total} project{projectStats.total === 1 ? '' : 's'}
            {projectStats.total > 0 ? ` · ${projectStats.active} active` : ''}
          </ThemedText>
        </View>
        <Link href={ROUTES.SEARCH as Href} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open global search"
            style={styles.searchIconButton}>
            <IconSymbol name="magnifyingglass" size={26} color={themeColors.primary} />
          </Pressable>
        </Link>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Pressable
          style={[
            styles.searchBarButton,
            {
              borderColor: themeColors.border,
              backgroundColor: themeColors.surfaceElevated,
            },
          ]}
          onPress={() => setIsSearchOpen(true)}>
          <ThemedText style={{ color: themeColors.mutedText }}>
            {searchQuery.trim() ? searchQuery : 'Search projects and experiments'}
          </ThemedText>
        </Pressable>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Projects</ThemedText>
          {myProjects.length + sharedProjects.length > 0 ? (
            <Link href={ROUTES.PROJECT_LIST as Href}>
              <ThemedText style={{ color: themeColors.primary }}>See all</ThemedText>
            </Link>
          ) : null}
        </View>

        <View style={styles.sectionBody}>
          {myProjects.length + sharedProjects.length === 0 ? (
            <HomeEmptyProjects onCreateProject={openCreateProject} />
          ) : (
            <>
              <ThemedText type="defaultSemiBold">My Projects</ThemedText>
              {myProjects.length === 0 ? (
                <ThemedText style={{ color: themeColors.mutedText }}>
                  No personal projects yet.
                </ThemedText>
              ) : null}
              {myProjects.map((project) => {
                const chip = projectChipColors(themeColors, project.status);
                return (
                  <Link key={project.id} href={ROUTE_PATHS.PROJECT_DETAIL(project.id)} asChild>
                    <Pressable
                      style={[
                        styles.projectCard,
                        {
                          borderColor: themeColors.border,
                          backgroundColor: themeColors.surfaceElevated,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Open project ${project.title}`}>
                      <View style={styles.projectCardTop}>
                        <ThemedText type="defaultSemiBold" style={styles.projectTitle} numberOfLines={2}>
                          {project.title}
                        </ThemedText>
                        <View style={[styles.statusChip, { borderColor: chip.border, backgroundColor: chip.background }]}>
                          <ThemedText style={{ fontSize: 12, fontWeight: '600' }}>
                            {formatProjectStatusLabel(project.status)}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.projectMeta}>
                        <ThemedText style={{ color: themeColors.mutedText }}>
                          {project.experimentCount} experiment{project.experimentCount === 1 ? '' : 's'}
                        </ThemedText>
                        <ThemedText style={{ color: themeColors.subtleText }}>
                          Updated {new Date(project.updatedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </ThemedText>
                      </View>
                    </Pressable>
                  </Link>
                );
              })}

              <ThemedText type="defaultSemiBold" style={styles.subsectionLabel}>
                Shared with Me
              </ThemedText>
              {sharedProjects.length === 0 ? (
                <ThemedText style={{ color: themeColors.mutedText }}>
                  No shared projects yet.
                </ThemedText>
              ) : null}
              {sharedProjects.map((project) => {
                const chip = projectChipColors(themeColors, project.status);
                return (
                  <Link key={project.id} href={ROUTE_PATHS.PROJECT_DETAIL(project.id)} asChild>
                    <Pressable
                      style={[
                        styles.projectCard,
                        {
                          borderColor: themeColors.border,
                          backgroundColor: themeColors.surfaceElevated,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Open shared project ${project.title}`}>
                      <View style={styles.projectCardTop}>
                        <View style={styles.sharedTitleRow}>
                          {project.ownerAvatarUrl ? (
                            <Image source={{ uri: project.ownerAvatarUrl }} style={styles.ownerAvatar} contentFit="cover" />
                          ) : (
                            <View
                              style={[
                                styles.ownerAvatarFallback,
                                { borderColor: themeColors.border, backgroundColor: themeColors.surface },
                              ]}>
                              <IconSymbol name="person.crop.circle.fill" size={14} color={themeColors.mutedText} />
                            </View>
                          )}
                          <ThemedText type="defaultSemiBold" style={styles.projectTitle} numberOfLines={2}>
                            {project.title}
                          </ThemedText>
                        </View>
                        <View style={[styles.statusChip, { borderColor: chip.border, backgroundColor: chip.background }]}>
                          <ThemedText style={{ fontSize: 12, fontWeight: '600' }}>
                            {formatProjectStatusLabel(project.status)}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.projectMeta}>
                        <View
                          style={[
                            styles.sharedBadge,
                            { borderColor: themeColors.accentBorder, backgroundColor: themeColors.accentSoft },
                          ]}>
                          <ThemedText style={styles.sharedBadgeText}>Shared with me</ThemedText>
                        </View>
                        <ThemedText style={{ color: themeColors.mutedText }}>
                          {project.experimentCount} experiment{project.experimentCount === 1 ? '' : 's'}
                        </ThemedText>
                      </View>
                    </Pressable>
                  </Link>
                );
              })}
            </>
          )}
        </View>

        <View style={[styles.sectionHeader, styles.sectionSpacer]}>
          <ThemedText type="subtitle">Activity feed</ThemedText>
        </View>
        <View style={styles.sectionBody}>
          {isActivityLoading ? (
            <ThemedText style={{ color: themeColors.mutedText }}>Loading activity…</ThemedText>
          ) : activityFeed.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              Activity will appear here when you create experiments, update statuses, add notes, and add
              hardware components.
            </ThemedText>
          ) : (
            activityFeed.map((item) => {
              const href = linkForActivity(item.entityType, item.entityId);
              const card = (
                <Pressable
                  style={[
                    styles.card,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.surfaceElevated,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={href ? `Open activity item ${item.description}` : item.description}>
                  <View style={styles.activityRow}>
                    <View
                      style={[
                        styles.activityIconWrap,
                        { borderColor: themeColors.border, backgroundColor: themeColors.heroTint },
                      ]}>
                      <IconSymbol name={iconForActivity(item.eventType)} size={16} color={themeColors.primary} />
                    </View>
                    <View style={styles.activityTextWrap}>
                      <ThemedText type="defaultSemiBold" numberOfLines={2}>
                        {item.description}
                      </ThemedText>
                      <ThemedText style={{ color: themeColors.subtleText, fontSize: 12 }}>
                        {formatRelativeTime(item.createdAt)}
                      </ThemedText>
                    </View>
                    {href ? (
                      <ThemedText style={{ color: themeColors.primary, fontSize: 12 }}>Open</ThemedText>
                    ) : null}
                  </View>
                </Pressable>
              );

              if (!href) {
                return <View key={item.id}>{card}</View>;
              }
              return (
                <Link key={item.id} href={href} asChild>
                  {card}
                </Link>
              );
            })
          )}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create project or experiment"
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        onPress={() => setIsCreateSheetOpen(true)}>
        <ThemedText
          style={styles.fabLabel}
          lightColor={themeColors.buttonPrimaryText}
          darkColor={themeColors.buttonPrimaryText}>
          +
        </ThemedText>
      </Pressable>
      {fabTooltipMessage ? <HomeFabGuidanceTooltip message={fabTooltipMessage} /> : null}

      <HomeQuickSearchOverlay
        isOpen={isSearchOpen}
        query={searchQuery}
        results={searchResults}
        onClose={() => setIsSearchOpen(false)}
      />
      {isSearchOpen ? (
        <View
          style={[
            styles.searchInputRow,
            {
              borderColor: themeColors.border,
              backgroundColor: themeColors.surfaceElevated,
            },
          ]}>
          <TextInput
            placeholder="Search projects and experiments..."
            placeholderTextColor={themeColors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            style={[styles.searchInput, { color: themeColors.text }]}
          />
          <Pressable onPress={() => setIsSearchOpen(false)}>
            <ThemedText style={{ color: themeColors.primary }}>Done</ThemedText>
          </Pressable>
        </View>
      ) : null}
      <HomeFabCreateSheet
        isOpen={isCreateSheetOpen}
        hasProjects={myProjects.length + sharedProjects.length > 0}
        recentProjectTitle={(myProjects[0] ?? sharedProjects[0])?.title ?? null}
        onCreateProject={openCreateProject}
        onCreateExperiment={openCreateExperimentForRecentProject}
        onClose={() => setIsCreateSheetOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerMain: {
    flex: 1,
    gap: 4,
  },
  searchIconButton: {
    padding: 6,
    marginTop: -2,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  searchBarButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionHeader: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionSpacer: {
    marginTop: 16,
  },
  sectionBody: {
    gap: 10,
  },
  projectCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  projectCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  projectTitle: {
    flex: 1,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  subsectionLabel: { marginTop: 8 },
  sharedTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  ownerAvatar: { width: 24, height: 24, borderRadius: 12 },
  ownerAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharedBadge: {
    borderWidth: 1,
    borderRadius: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sharedBadgeText: { fontSize: 11, fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    gap: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextWrap: {
    flex: 1,
    gap: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
  },
  fabLabel: {
    fontSize: 30,
    lineHeight: 33,
  },
  searchInputRow: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    zIndex: 40,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
});
