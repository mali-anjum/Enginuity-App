import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { selectUser } from '@/auth/state/authSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ValuePropSlide } from '@/onboarding/molecules/value-prop-slide';
import { OnboardingBrandBlock } from '@/onboarding/organisms/onboarding-brand-block';
import { completeOnboarding, setSelectedDiscipline } from '@/onboarding/state/onboardingSlice';
import {
  getSupabaseClientOrNull,
  withSupabaseClient,
} from '@/sharedModules/services/supabase/supabaseClient';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const ONBOARDING_SCREENS = [
  {
    emoji: '📁',
    title: 'Organise all your engineering projects',
    description: 'Group tasks, goals, and milestones in one place so every project stays focused.',
  },
  {
    emoji: '🧪',
    title: 'Track experiments with hardware components',
    description: 'Capture experiment context, devices, and outcomes so iterations are easy to compare.',
  },
  {
    emoji: '🔎',
    title: 'Search everything, find anything instantly',
    description: 'Quickly find notes, experiments, and project details without digging through screens.',
  },
] as const;

const DISCIPLINE_OPTIONS = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'cs', label: 'CS' },
  { value: 'physics', label: 'Physics' },
  { value: 'other', label: 'Other' },
] as const;

const TOTAL_STEPS = ONBOARDING_SCREENS.length + 1;

export default function OnboardingWelcomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDiscipline, setLocalSelectedDiscipline] = useState<
    (typeof DISCIPLINE_OPTIONS)[number]['value'] | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const isDisciplineStep = stepIndex === TOTAL_STEPS - 1;
  const canSkip = stepIndex > 0;

  const finishOnboarding = async (discipline: (typeof DISCIPLINE_OPTIONS)[number]['value'] | null) => {
    if (isSaving) return;
    setSaveError(null);

    if (!user?.id) {
      router.replace('/auth/login');
      return;
    }

    setIsSaving(true);
    try {
      if (!getSupabaseClientOrNull()) {
        setSaveError('Service is starting up. Please try again.');
        return;
      }

      const [profileUpdate, userUpdate] = await withSupabaseClient((client) =>
        Promise.all([
          client
            .from('profiles')
            .update({
              onboarding_completed: true,
              field_of_study: discipline,
            })
            .eq('user_id', user.id),
          client.from('users').update({ is_new_user: false }).eq('id', user.id),
        ]),
      );

      if (profileUpdate.error) {
        throw new Error(profileUpdate.error.message);
      }

      if (userUpdate.error) {
        throw new Error(userUpdate.error.message);
      }

      if (discipline) {
        dispatch(setSelectedDiscipline(discipline));
      }
      dispatch(completeOnboarding());
      router.replace('/');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not finish setup. Please try again.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <OnboardingBrandBlock stepIndex={stepIndex} totalSteps={TOTAL_STEPS} />
        <View style={[styles.heroCard, { backgroundColor: themeColors.heroTint, borderColor: themeColors.accentBorder }]}>
          <ThemedText style={styles.heroEyebrow}>Welcome to your engineering workspace</ThemedText>
          <ThemedText type="subtitle" style={styles.heroTitle}>
            Build your setup in four quick steps.
          </ThemedText>
        </View>

        {!isDisciplineStep ? (
          <View style={styles.slideWrap}>
            <ValuePropSlide
              emoji={ONBOARDING_SCREENS[stepIndex].emoji}
              title={ONBOARDING_SCREENS[stepIndex].title}
              description={ONBOARDING_SCREENS[stepIndex].description}
            />
          </View>
        ) : (
          <View
            style={[
              styles.disciplineCard,
              {
                backgroundColor: themeColors.surfaceElevated,
                borderColor: themeColors.accentBorder,
              },
            ]}>
            <ThemedText type="subtitle">Choose your discipline</ThemedText>
            <ThemedText style={{ color: themeColors.subtleText }}>
              This helps us personalize your project and experiment experience.
            </ThemedText>
            <View style={styles.disciplineOptions}>
              {DISCIPLINE_OPTIONS.map((option) => {
                const isSelected = selectedDiscipline === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setLocalSelectedDiscipline(option.value)}
                    style={[
                      styles.disciplineButton,
                      {
                        borderColor: isSelected ? themeColors.primary : themeColors.border,
                        backgroundColor: isSelected ? themeColors.heroTint : themeColors.background,
                      },
                    ]}>
                    <ThemedText type="defaultSemiBold">{option.label}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          {canSkip ? (
            <Pressable
              style={[styles.secondaryButton, { borderColor: themeColors.border }]}
              disabled={isSaving}
              onPress={() => {
                void finishOnboarding(null);
              }}>
              <ThemedText style={{ color: themeColors.mutedText }}>Skip for now</ThemedText>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            disabled={isSaving}
            onPress={async () => {
              if (!isDisciplineStep) {
                setStepIndex((prev) => prev + 1);
                return;
              }
              if (!selectedDiscipline) {
                setSaveError('Select a discipline to continue, or tap Skip for now.');
                return;
              }
              await finishOnboarding(selectedDiscipline);
            }}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.primaryButtonLabel}
              lightColor={themeColors.buttonPrimaryText}
              darkColor={themeColors.buttonPrimaryText}>
              {isSaving
                ? 'Finishing setup...'
                : isDisciplineStep
                  ? 'Finish onboarding'
                  : 'Continue'}
            </ThemedText>
          </Pressable>
          {saveError ? (
            <ThemedText
              style={styles.errorText}
              lightColor={themeColors.danger}
              darkColor={themeColors.danger}>
              {saveError}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText style={[styles.footer, { color: themeColors.mutedText }]}>
          You can personalize discipline preferences after sign-in.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    gap: 20,
    paddingBottom: 48,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 6,
  },
  heroEyebrow: {
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.8,
    opacity: 0.85,
  },
  heroTitle: {
    lineHeight: 30,
  },
  slideWrap: {
    width: '100%',
  },
  disciplineCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  disciplineOptions: {
    marginTop: 4,
    gap: 10,
  },
  disciplineButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  actions: {
    marginTop: 4,
    gap: 10,
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: Colors.light.background,
    fontSize: 16,
  },
  footer: {
    marginTop: 2,
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 13,
  },
});
