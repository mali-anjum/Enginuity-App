import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import {
  selectFilteredProjects,
  selectProjectFilter,
  setProjectFilter,
} from '@/project/state/projectSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const FILTERS = ['active', 'completed', 'archived', 'favourites'] as const;

export default function ProjectListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectFilteredProjects);
  const activeFilter = useAppSelector(selectProjectFilter);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Project List</ThemedText>
          <Link href={'/project/create' as Href}>
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
          {projects.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              No projects yet for this filter.
            </ThemedText>
          ) : (
            projects.map((project) => (
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
                  <ThemedText style={{ color: themeColors.mutedText }} numberOfLines={2}>
                    {project.description || 'No description'}
                  </ThemedText>
                </Pressable>
              </Link>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  list: { gap: 10 },
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 4 },
});
