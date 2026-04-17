import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';
import { selectTheme, setTheme, type ThemeMode } from '@/ui/state/uiSlice';

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export default function AppearanceScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Appearance</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Theme preference is saved on this device via Redux persist (AsyncStorage).
        </ThemedText>

        <View style={styles.row}>
          {OPTIONS.map((option) => {
            const active = theme === option.value;
            return (
              <Pressable
                key={option.value}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.surfaceElevated,
                  },
                ]}
                onPress={() => dispatch(setTheme(option.value))}>
                <ThemedText>{option.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
});
