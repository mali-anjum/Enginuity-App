import { Link, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { HARDWARE_CATEGORIES } from '@/hardware/constants';
import type { HardwareCategory } from '@/hardware/constants';
import type { HardwareItem } from '@/hardware/state/hardwareSlice';
import { ROUTES } from '@/sharedModules/navigation/routes';

const LIST_MAX_HEIGHT = Math.round(Dimensions.get('window').height * 0.42);

type HardwarePickerSheetProps = {
  isOpen: boolean;
  hardwareItems: HardwareItem[];
  selectedHardwareIds: string[];
  onToggle: (hardwareId: string) => void;
  onClose: () => void;
};

export function HardwarePickerSheet({
  isOpen,
  hardwareItems,
  selectedHardwareIds,
  onToggle,
  onClose,
}: HardwarePickerSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [query, setQuery] = useState('');
  const [pickerCategory, setPickerCategory] = useState<HardwareCategory | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return hardwareItems.filter((hardware) => {
      if (pickerCategory && hardware.category !== pickerCategory) return false;
      if (!normalizedQuery) return true;
      const haystack = `${hardware.name} ${hardware.category} ${hardware.specs}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [hardwareItems, normalizedQuery, pickerCategory]);

  const selectedCount = selectedHardwareIds.length;

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss hardware picker" />
      <ThemedView
        style={[
          styles.sheet,
          { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
        ]}>
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText type="subtitle">Hardware Library</ThemedText>
            <ThemedText style={{ color: themeColors.mutedText }}>
              Tap to multi-select components for this experiment.
            </ThemedText>
          </View>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, category, specs…"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.searchInput, { borderColor: themeColors.border, color: themeColors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          <Pressable
            onPress={() => setPickerCategory(null)}
            style={[
              styles.catChip,
              {
                borderColor:
                  pickerCategory === null ? themeColors.primary : themeColors.border,
                backgroundColor:
                  pickerCategory === null ? themeColors.heroTint : themeColors.background,
              },
            ]}>
            <ThemedText type={pickerCategory === null ? 'defaultSemiBold' : 'default'}>All</ThemedText>
          </Pressable>
          {HARDWARE_CATEGORIES.map((category) => {
            const active = pickerCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => setPickerCategory(active ? null : category)}
                style={[
                  styles.catChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText type={active ? 'defaultSemiBold' : 'default'}>{category}</ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView style={{ maxHeight: LIST_MAX_HEIGHT }} contentContainerStyle={styles.list}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyBlock}>
              <ThemedText style={{ color: themeColors.mutedText }}>
                {hardwareItems.length === 0
                  ? 'Your hardware library is empty.'
                  : 'No matches for this filter or search.'}
              </ThemedText>
              <Link href={ROUTES.hardwareAdd as Href}>
                <ThemedText style={{ color: themeColors.primary }}>Add hardware to library</ThemedText>
              </Link>
            </View>
          ) : (
            filteredItems.map((hardware) => {
              const selected = selectedHardwareIds.includes(hardware.id);
              return (
                <Pressable
                  key={hardware.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() => onToggle(hardware.id)}
                  style={[
                    styles.row,
                    {
                      borderColor: selected ? themeColors.primary : themeColors.border,
                      backgroundColor: selected ? themeColors.heroTint : themeColors.background,
                    },
                  ]}>
                  <View style={[styles.checkbox, { borderColor: themeColors.primary }]}>
                    {selected ? (
                      <ThemedText style={{ color: themeColors.primary }}>✓</ThemedText>
                    ) : null}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <ThemedText type="defaultSemiBold">{hardware.name}</ThemedText>
                    <ThemedText style={{ color: themeColors.mutedText }}>{hardware.category}</ThemedText>
                    {hardware.specs.trim() ? (
                      <ThemedText style={{ color: themeColors.subtleText }} numberOfLines={2}>
                        {hardware.specs}
                      </ThemedText>
                    ) : null}
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <View style={styles.footer}>
          <ThemedText style={{ color: themeColors.mutedText }}>
            {selectedCount === 0
              ? 'None selected'
              : `${selectedCount} selected`}
          </ThemedText>
          <Pressable
            onPress={onClose}
            style={[styles.doneButton, { backgroundColor: themeColors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Confirm hardware selection">
            <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
              Done
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 35, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.36)' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 10,
    maxHeight: '92%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  catChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  list: { gap: 8, paddingBottom: 4 },
  emptyBlock: { gap: 10, paddingVertical: 16, alignItems: 'flex-start' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148,163,184,0.35)',
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  doneButton: {
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
});
