import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import {
  USAGE_LOCATION_OPTIONS,
  USAGE_TIME_OPTIONS,
  WEEKLY_HOURS_OPTIONS,
} from '@/onboarding/constants/onboardingLabels';
import { setUsageFields } from '@/onboarding/state/onboardingSlice';
import type { UsageLocation, UsageTimePreference, WeeklyHoursBand } from '@/onboarding/types/profileDraft';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function OnboardingUsageScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const draft = useAppSelector((s) => s.onboarding.profileDraft);

  const patch = (partial: {
    usageTimePreference?: UsageTimePreference | null;
    usageLocation?: UsageLocation | null;
    weeklyHoursBand?: WeeklyHoursBand | null;
  }) => {
    dispatch(
      setUsageFields({
        usageTimePreference: partial.usageTimePreference ?? draft.usageTimePreference,
        usageLocation: partial.usageLocation ?? draft.usageLocation,
        weeklyHoursBand: partial.weeklyHoursBand ?? draft.weeklyHoursBand,
      }),
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">When & where you use Enginuity</ThemedText>
        <ThemedText style={{ color: themeColors.subtleText }}>
          Optional—helps us prioritize reminders and future features.
        </ThemedText>

        <ThemedText type="defaultSemiBold">Typical time of day</ThemedText>
        <View style={styles.chips}>
          {USAGE_TIME_OPTIONS.map((opt) => {
            const isOn = draft.usageTimePreference === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() =>
                  patch({
                    usageTimePreference: isOn ? null : opt.value,
                  })
                }
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

        <ThemedText type="defaultSemiBold">Where</ThemedText>
        <View style={styles.chips}>
          {USAGE_LOCATION_OPTIONS.map((opt) => {
            const isOn = draft.usageLocation === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() =>
                  patch({
                    usageLocation: isOn ? null : opt.value,
                  })
                }
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

        <ThemedText type="defaultSemiBold">Rough weekly time on coursework / projects</ThemedText>
        <View style={styles.chips}>
          {WEEKLY_HOURS_OPTIONS.map((opt) => {
            const isOn = draft.weeklyHoursBand === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() =>
                  patch({
                    weeklyHoursBand: isOn ? null : opt.value,
                  })
                }
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
            onPress={() => router.push('/onboarding/goals' as never)}>
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
  scroll: { padding: 24, gap: 10, paddingBottom: 40 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primary: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
});
