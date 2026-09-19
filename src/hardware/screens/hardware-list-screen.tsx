import { Link, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { SkeletonShimmer } from '@/common/atoms/skeleton-shimmer';
import { Colors, Radii, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ListEmptyState } from '@/common/organisms/list-empty-state';
import { HARDWARE_CATEGORIES } from '@/hardware/constants';
import type { HardwareCategory } from '@/hardware/constants';
import {
  selectAllHardware,
  selectHardwareCategoryFilter,
  setHardwareCategoryFilter,
} from '@/hardware/state/hardwareSlice';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const FILTER_OPTIONS: ('All' | HardwareCategory)[] = ['All', ...HARDWARE_CATEGORIES];

export default function HardwareListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const filterByCategory = useAppSelector(selectHardwareCategoryFilter);
  const hardwareItems = useAppSelector(selectAllHardware);
  const isLoading = useAppSelector((state) => state.hardware.isLoading);
  const filteredItems = filterByCategory
    ? hardwareItems.filter((item) => item.category === filterByCategory)
    : hardwareItems;

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Hardware Library</ThemedText>
          <Link href={ROUTES.HARDWARE_ADD as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Add Hardware</ThemedText>
          </Link>
        </View>

        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map((option) => {
            const active =
              option === 'All'
                ? filterByCategory === null
                : filterByCategory === option;
            return (
              <Pressable
                key={option}
                onPress={() =>
                  dispatch(setHardwareCategoryFilter(option === 'All' ? null : option))
                }
                style={[
                  styles.filterChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{option}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.list}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <View
                key={`hardware-skeleton-${index}`}
                style={[
                  styles.card,
                  { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                ]}>
                <SkeletonShimmer style={styles.hardwareTitleSkeleton} />
                <SkeletonShimmer style={styles.hardwareCategorySkeleton} />
                <SkeletonShimmer style={styles.hardwareLineSkeleton} />
                <SkeletonShimmer style={styles.hardwareLineShortSkeleton} />
              </View>
            ))
          ) : filteredItems.length === 0 ? (
            <ListEmptyState
              icon="cpu.fill"
              headline="Build your hardware library"
              body="Save boards, sensors, and modules so every project can reuse proven components."
              ctaLabel="Add Hardware"
              onPressCta={() => router.push(ROUTES.HARDWARE_ADD as Href)}
            />
          ) : (
            filteredItems.map((item) => (
              <Link key={item.id} href={ROUTE_PATHS.HARDWARE_DETAIL(item.id)} asChild>
                <Pressable
                  style={[
                    styles.card,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.surfaceElevated,
                      shadowColor: themeColors.cardShadow,
                    },
                  ]}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>{item.category}</ThemedText>
                  {item.specs.trim() ? (
                    <ThemedText style={{ color: themeColors.subtleText }} numberOfLines={2}>
                      {item.specs}
                    </ThemedText>
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
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl + Spacing.sm },
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
  hardwareTitleSkeleton: { height: 16, borderRadius: 6, width: '57%' },
  hardwareCategorySkeleton: { height: 12, borderRadius: 6, width: '32%', marginTop: 2 },
  hardwareLineSkeleton: { height: 12, borderRadius: 6, width: '94%', marginTop: 6 },
  hardwareLineShortSkeleton: { height: 12, borderRadius: 6, width: '69%', marginTop: 4 },
});
