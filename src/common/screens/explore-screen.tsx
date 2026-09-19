import { Link, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { TagChip } from '@/common/atoms/tag-chip';
import { Colors, Radii, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ListEmptyState } from '@/common/organisms/list-empty-state';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { HARDWARE_CATEGORIES } from '@/hardware/constants';
import { selectAllHardware } from '@/hardware/state/hardwareSlice';
import { selectTagCounts } from '@/notes/state/notesSlice';
import { selectProjectStats } from '@/project/state/projectSlice';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { IconSymbol } from '@/sharedModules/ui/atoms/icon-symbol';
import { useAppSelector } from '@/store/hooks';

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const hardwareItems = useAppSelector(selectAllHardware);
  const projectStats = useAppSelector(selectProjectStats);
  const tagCounts = useAppSelector(selectTagCounts).slice(0, 12);

  const categoryCounts = HARDWARE_CATEGORIES.map((category) => ({
    category,
    count: hardwareItems.filter((item) => item.category === category).length,
  }));

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <ThemedText type="title">Explore</ThemedText>
          <ThemedText type="caption" style={{ color: themeColors.mutedText }}>
            Browse your hardware library, projects, and notes by tag.
          </ThemedText>
        </View>

        <Link href={ROUTES.SEARCH as Href} asChild>
          <Pressable
            style={[
              styles.searchRow,
              { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
            ]}>
            <IconSymbol name="magnifyingglass" size={18} color={themeColors.mutedText} />
            <ThemedText style={{ color: themeColors.mutedText }}>Search projects, hardware, notes…</ThemedText>
          </Pressable>
        </Link>

        <View style={styles.section}>
          <ThemedText type="eyebrow" style={{ color: themeColors.mutedText }}>
            Projects
          </ThemedText>
          <View style={styles.statRow}>
            <StatTile label="Active" value={projectStats.active} />
            <StatTile label="Completed" value={projectStats.completed} />
            <StatTile label="Favourites" value={projectStats.favourites} />
          </View>
          <Link href={ROUTES.PROJECT_LIST as Href}>
            <ThemedText type="link">View all projects</ThemedText>
          </Link>
        </View>

        <View style={styles.section}>
          <ThemedText type="eyebrow" style={{ color: themeColors.mutedText }}>
            Hardware Library
          </ThemedText>
          {hardwareItems.length === 0 ? (
            <ListEmptyState
              icon="cpu.fill"
              headline="Build your hardware library"
              body="Save boards, sensors, and modules so every project can reuse proven components."
              ctaLabel="Add Hardware"
              onPressCta={() => router.push(ROUTES.HARDWARE_ADD as Href)}
            />
          ) : (
            <>
              <View style={styles.chipRow}>
                {categoryCounts.map(({ category, count }) => (
                  <View
                    key={category}
                    style={[
                      styles.categoryChip,
                      { borderColor: themeColors.border, backgroundColor: themeColors.background },
                    ]}>
                    <ThemedText type="defaultSemiBold">{category}</ThemedText>
                    <ThemedText type="caption" style={{ color: themeColors.mutedText }}>
                      {count}
                    </ThemedText>
                  </View>
                ))}
              </View>
              <Link href={ROUTES.HARDWARE_LIST as Href}>
                <ThemedText type="link">View all hardware</ThemedText>
              </Link>
            </>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="eyebrow" style={{ color: themeColors.mutedText }}>
            Browse by tag
          </ThemedText>
          <View style={styles.chipRow}>
            {tagCounts.map(({ tag, count }) => (
              <TagChip
                key={tag}
                label={`${tag} (${count})`}
                onPress={() => router.push(ROUTE_PATHS.NOTES_TAGS_WITH_TAG(tag))}
              />
            ))}
          </View>
          <Link href={ROUTES.NOTES_TAGS as Href}>
            <ThemedText type="link">View all tags</ThemedText>
          </Link>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  return (
    <View
      style={[
        styles.statTile,
        { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
      ]}>
      <ThemedText type="heading">{value}</ThemedText>
      <ThemedText type="caption" style={{ color: themeColors.mutedText }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.xxl, paddingBottom: Spacing.xxxl + Spacing.sm },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.md,
  },
  section: { gap: Spacing.sm },
  statRow: { flexDirection: 'row', gap: Spacing.sm },
  statTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chipRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  categoryChip: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
    minWidth: 76,
  },
});
