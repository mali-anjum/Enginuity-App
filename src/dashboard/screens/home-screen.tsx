import { Link, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  createExperimentThunk,
  selectRecentExperiments,
} from '@/experiment/state/experimentSlice';
import {
  selectProjectStats,
  selectProjectsSortedByLastActivity,
} from '@/project/state/projectSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { IconSymbol } from '@/sharedModules/ui/atoms/icon-symbol';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

import { HomeFabCreateSheet } from '../organisms/home-fab-create-sheet';
import { HomeQuickSearchOverlay } from '../organisms/home-quick-search-overlay';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const projectsByActivity = useAppSelector(selectProjectsSortedByLastActivity);
  const recentExperiments = useAppSelector(selectRecentExperiments);
  const projectStats = useAppSelector(selectProjectStats);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activityFeed = useMemo(() => {
    return recentExperiments.map((experiment) => ({
      id: experiment.id,
      title: experiment.title,
      subtitle: `Status: ${experiment.status.replace('_', ' ')}`,
    }));
  }, [recentExperiments]);

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const projectMatches = projectsByActivity
      .filter((project) => project.title.toLowerCase().includes(normalizedQuery))
      .map((project) => ({
        id: `project-${project.id}`,
        title: project.title,
        subtitle: 'Project',
      }));

    const experimentMatches = recentExperiments
      .filter((experiment) => experiment.title.toLowerCase().includes(normalizedQuery))
      .map((experiment) => ({
        id: `experiment-${experiment.id}`,
        title: experiment.title,
        subtitle: 'Experiment activity',
      }));

    return [...projectMatches, ...experimentMatches].slice(0, 8);
  }, [searchQuery, projectsByActivity, recentExperiments]);

  const createProject = () => {
    setIsCreateSheetOpen(false);
    router.push('/project/create');
  };

  const createExperiment = () => {
    const fallbackProject = projectsByActivity[0];
    if (!fallbackProject) {
      setIsCreateSheetOpen(false);
      return;
    }
    void dispatch(
      createExperimentThunk({
        title: `Experiment ${new Date().toLocaleTimeString()}`,
        projectId: fallbackProject.id,
      }),
    );
    setIsCreateSheetOpen(false);
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
            {projectStats.total} projects - {projectStats.completed} completed
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

      <View style={styles.content}>
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
            {searchQuery.trim() ? searchQuery : 'Quick search projects and activity'}
          </ThemedText>
        </Pressable>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Projects</ThemedText>
          <Link href={'/project' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Open Project Module</ThemedText>
          </Link>
        </View>

        <View style={styles.sectionBody}>
          {projectsByActivity.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              No projects yet. Use the + button to create one.
            </ThemedText>
          ) : (
            projectsByActivity.map((project) => (
              <Link key={project.id} href={`/project/${project.id}` as Href} asChild>
                <Pressable
                  style={[
                    styles.card,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.surfaceElevated,
                    },
                  ]}>
                  <ThemedText type="defaultSemiBold">{project.title}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>
                    Last activity {new Date(project.updatedAt).toLocaleString()}
                  </ThemedText>
                </Pressable>
              </Link>
            ))
          )}
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recent Activity</ThemedText>
          <Link href={'/profile' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Open Profile Module</ThemedText>
          </Link>
          <Link href={'/settings' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Open Settings Module</ThemedText>
          </Link>
          <Link href={'/experiment' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Open Experiment Module</ThemedText>
          </Link>
          <Link href={'/notes' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Open Notes Module</ThemedText>
          </Link>
          <Link href={'/hardware' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Open Hardware Library</ThemedText>
          </Link>
        </View>
        <View style={styles.sectionBody}>
          {activityFeed.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              No experiment activity yet. Create an experiment from the + button.
            </ThemedText>
          ) : (
            activityFeed.map((activity) => (
              <View
                key={activity.id}
                style={[
                  styles.card,
                  {
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.surfaceElevated,
                  },
                ]}>
                <ThemedText type="defaultSemiBold">{activity.title}</ThemedText>
                <ThemedText style={{ color: themeColors.mutedText }}>{activity.subtitle}</ThemedText>
              </View>
            ))
          )}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
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
            placeholder="Search projects and activity..."
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
        onCreateProject={createProject}
        onCreateExperiment={createExperiment}
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
  content: {
    flex: 1,
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
  },
  sectionBody: {
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
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
