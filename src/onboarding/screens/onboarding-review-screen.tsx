import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import {
  FOCUS_AREA_OPTIONS,
  INSTITUTION_TYPE_OPTIONS,
  USAGE_LOCATION_OPTIONS,
  USAGE_TIME_OPTIONS,
  WEEKLY_HOURS_OPTIONS,
} from '@/onboarding/constants/onboardingLabels';
import { markPreAuthProfileCompleted } from '@/onboarding/state/onboardingSlice';
import type { OnboardingProfileDraft } from '@/onboarding/types/profileDraft';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

function labelFor<T extends string>(options: { value: T; label: string }[], v: T | null) {
  if (!v) return '—';
  return options.find((o) => o.value === v)?.label ?? v;
}

function summarizeDraft(d: OnboardingProfileDraft) {
  const focus =
    d.focusAreas.length > 0
      ? d.focusAreas
          .map((f) => FOCUS_AREA_OPTIONS.find((o) => o.value === f)?.label ?? f)
          .join(', ')
      : '—';
  const institution =
    [d.institutionName, labelFor(INSTITUTION_TYPE_OPTIONS, d.institutionType)].filter(Boolean).join(' · ') ||
    '—';
  const usage = [
    labelFor(USAGE_TIME_OPTIONS, d.usageTimePreference),
    labelFor(USAGE_LOCATION_OPTIONS, d.usageLocation),
    labelFor(WEEKLY_HOURS_OPTIONS, d.weeklyHoursBand),
  ]
    .filter((x) => x !== '—')
    .join(' · ');
  return {
    focus,
    institution,
    field: d.fieldOfStudy.trim() || '—',
    usage: usage || '—',
    goal: d.primaryGoal.trim() || '—',
    discovery: d.discoverySource.trim() || '—',
  };
}

export default function OnboardingReviewScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.onboarding.profileDraft);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const s = summarizeDraft(draft);

  const Row = ({
    title,
    value,
    editHref,
  }: {
    title: string;
    value: string;
    editHref:
      | typeof ROUTES.onboardingFocus
      | typeof ROUTES.onboardingEducation
      | typeof ROUTES.onboardingUsage
      | typeof ROUTES.onboardingGoals;
  }) => (
    <View style={[styles.card, { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated }]}>
      <View style={styles.cardHead}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <Pressable onPress={() => router.push(editHref as never)}>
          <ThemedText type="link">Edit</ThemedText>
        </Pressable>
      </View>
      <ThemedText style={{ color: themeColors.subtleText }}>{value}</ThemedText>
    </View>
  );

  const continueSignup = () => {
    dispatch(markPreAuthProfileCompleted());
    router.replace(ROUTES.authSignup);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Save my plan</ThemedText>
        <ThemedText style={{ color: themeColors.subtleText }}>
          Confirm what we&apos;ll use to personalize Enginuity. You can edit any section before creating your
          account.
        </ThemedText>

        <Row title="Focus areas" value={s.focus} editHref={ROUTES.onboardingFocus} />
        <Row
          title="Education & affiliation"
          value={`${s.institution}\n${s.field}`}
          editHref={ROUTES.onboardingEducation}
        />
        <Row title="Usage context" value={s.usage} editHref={ROUTES.onboardingUsage} />
        <Row title="Goals & discovery" value={`${s.goal}\n${s.discovery}`} editHref={ROUTES.onboardingGoals} />

        <View style={styles.row}>
          <Pressable
            style={[styles.secondary, { borderColor: themeColors.border }]}
            onPress={() => router.push(ROUTES.onboardingGoals as never)}>
            <ThemedText>Back</ThemedText>
          </Pressable>
          <Pressable style={[styles.primary, { backgroundColor: themeColors.primary }]} onPress={continueSignup}>
            <ThemedText style={{ color: themeColors.buttonPrimaryText }} type="defaultSemiBold">
              Continue to sign up
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: 24, gap: 12, paddingBottom: 48 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
