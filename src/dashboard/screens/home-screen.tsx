import { Link, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { experimentStatusLabel } from '@/experiment/constants';
import {
  selectProjectsWithExperimentCounts,
  selectRecentExperimentsForHome,
} from '@/dashboard/selectors/home-dashboard';
import { HomeEmptyProjects } from '@/dashboard/organisms/home-empty-projects';
import type { Project } from '@/project/state/projectSlice';
import { selectProjectStats } from '@/project/state/projectSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { IconSymbol } from '@/sharedModules/ui/atoms/icon-symbol';
import { useAppSelector } from '@/sharedModules/state/hooks';

import { HomeFabCreateSheet } from '../organisms/home-fab-create-sheet';
import { HomeQuickSearchOverlay } from '../organisms/home-quick-search-overlay';

function formatProjectStatusLabel(status: Project['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
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
  const projectsWithCounts = useAppSelector(selectProjectsWithExperimentCounts);
  const recentRows = useAppSelector(selectRecentExperimentsForHome);
  const projectStats = useAppSelector(selectProjectStats);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const projectMatches = projectsWithCounts
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
  }, [searchQuery, projectsWithCounts, recentRows]);

  const openCreateProject = () => {
    setIsCreateSheetOpen(false);
    router.push('/project/create');
  };

  const openCreateExperimentForRecentProject = () => {
    const target = projectsWithCounts[0];
    if (!target) {
      setIsCreateSheetOpen(false);
      return;
    }
    setIsCreateSheetOpen(false);
    router.push(`/experiment/create?projectId=${encodeURIComponent(target.id)}` as Href);
  };

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
        <Link href={'/search' as Href} asChild>
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
          {projectsWithCounts.length > 0 ? (
            <Link href={'/project' as Href}>
              <ThemedText style={{ color: themeColors.primary }}>See all</ThemedText>
            </Link>
          ) : null}
        </View>

        <View style={styles.sectionBody}>
          {projectsWithCounts.length === 0 ? (
            <HomeEmptyProjects onCreateProject={openCreateProject} />
          ) : (
            projectsWithCounts.map((project) => {
              const chip = projectChipColors(themeColors, project.status);
              return (
                <Link key={project.id} href={`/project/${project.id}` as Href} asChild>
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
            })
          )}
        </View>

        <View style={[styles.sectionHeader, styles.sectionSpacer]}>
          <ThemedText type="subtitle">Recent experiments</ThemedText>
          {recentRows.length > 0 ? (
            <Link href={'/experiment' as Href}>
              <ThemedText style={{ color: themeColors.primary }}>See all</ThemedText>
            </Link>
          ) : null}
        </View>
        <View style={styles.sectionBody}>
          {recentRows.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              {projectsWithCounts.length === 0
                ? 'Experiments you log will appear here.'
                : 'No experiments yet. Tap + to log one in your latest project.'}
            </ThemedText>
          ) : (
            recentRows.map(({ experiment, projectTitle }) => (
              <Link key={experiment.id} href={`/experiment/${experiment.id}` as Href} asChild>
                <Pressable
                  style={[
                    styles.card,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.surfaceElevated,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Open experiment ${experiment.title}`}>
                  <ThemedText type="defaultSemiBold" numberOfLines={2}>
                    {experiment.title}
                  </ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }} numberOfLines={1}>
                    {projectTitle} · {experimentStatusLabel(experiment.status)}
                  </ThemedText>
                  <ThemedText style={{ color: themeColors.subtleText, fontSize: 12 }}>
                    {new Date(experiment.updatedAt).toLocaleString()}
                  </ThemedText>
                </Pressable>
              </Link>
            ))
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
        hasProjects={projectsWithCounts.length > 0}
        recentProjectTitle={projectsWithCounts[0]?.title ?? null}
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
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    gap: 4,
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
