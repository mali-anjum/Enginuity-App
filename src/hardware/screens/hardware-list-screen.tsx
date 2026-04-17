import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import {
  selectAllHardware,
  selectHardwareTypeFilter,
  setHardwareTypeFilter,
  type HardwareItem,
} from '@/hardware/state/hardwareSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const TYPE_OPTIONS: ('All' | HardwareItem['type'])[] = ['All', 'MCU', 'Sensor', 'Actuator', 'Module', 'Tool', 'Other'];

export default function HardwareListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const filterByType = useAppSelector(selectHardwareTypeFilter);
  const hardwareItems = useAppSelector(selectAllHardware);
  const filteredItems = filterByType
    ? hardwareItems.filter((item) => item.type === filterByType)
    : hardwareItems;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Hardware Library</ThemedText>
          <Link href={'/hardware/add' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Add Hardware</ThemedText>
          </Link>
        </View>

        <View style={styles.filterRow}>
          {TYPE_OPTIONS.map((option) => {
            const active = option === 'All' ? filterByType === null : filterByType === option;
            return (
              <Pressable
                key={option}
                onPress={() => dispatch(setHardwareTypeFilter(option === 'All' ? null : option))}
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
          {filteredItems.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No hardware found.</ThemedText>
          ) : (
            filteredItems.map((item) => (
              <Link key={item.id} href={`/hardware/${item.id}` as Href} asChild>
                <Pressable
                  style={[
                    styles.card,
                    { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                  ]}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>{item.type}</ThemedText>
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
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  list: { gap: 10 },
  card: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 4 },
});
