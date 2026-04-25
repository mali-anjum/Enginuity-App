import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { FOCUS_AREA_OPTIONS } from '@/onboarding/constants/onboardingLabels';
import { setFocusAreas } from '@/onboarding/state/onboardingSlice';
import type { FocusArea } from '@/onboarding/types/profileDraft';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function OnboardingFocusScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const selected = useAppSelector((s) => s.onboarding.profileDraft.focusAreas);

  const toggle = (value: FocusArea) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    dispatch(setFocusAreas(next));
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Focus areas</ThemedText>
        <ThemedText style={{ color: themeColors.subtleText }}>
          What do you work on most? Pick all that apply—we&apos;ll tune defaults and suggestions.
        </ThemedText>
        <View style={styles.chips}>
          {FOCUS_AREA_OPTIONS.map((opt) => {
            const isOn = selected.includes(opt.value);
            return (
              <Pressable
                key={opt.value}
                onPress={() => toggle(opt.value)}
                style={[
                  styles.chip,
                  {
                    borderColor: isOn ? themeColors.primary : themeColors.border,
                    backgroundColor: isOn ? themeColors.heroTint : themeColors.surfaceElevated,
                  },
                ]}>
                <ThemedText type="defaultSemiBold">{opt.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.row}>
          <Pressable
            style={[styles.secondary, { borderColor: themeColors.border }]}
            onPress={() => router.back()}>
            <ThemedText>Back</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.primary, { backgroundColor: themeColors.primary }]}
            onPress={() => router.push(ROUTES.onboardingEducation as never)}>
            <ThemedText style={{ color: themeColors.buttonPrimaryText }} type="defaultSemiBold">
              Continue
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: 24, gap: 14, paddingBottom: 40 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primary: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
});
