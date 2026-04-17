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
import { completeOnboarding } from '@/onboarding/state/onboardingSlice';
import {
  getSupabaseClientOrNull,
  withSupabaseClient,
} from '@/sharedModules/services/supabase/supabaseClient';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const VALUE_PROPS = [
  {
    emoji: '🧪',
    title: 'Run experiments with context',
    description: 'Capture hardware, observations, and files in one structured flow.',
  },
  {
    emoji: '📓',
    title: 'Study notes that stay searchable',
    description: 'Tag engineering topics and link notes to projects when you need traceability.',
  },
  {
    emoji: '🔎',
    title: 'Search across your lab work',
    description: 'Find sensors, commits, and concepts across experiments and notes.',
  },
] as const;

export default function OnboardingWelcomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <OnboardingBrandBlock stepIndex={0} totalSteps={VALUE_PROPS.length} />
        <View style={[styles.heroCard, { backgroundColor: themeColors.heroTint, borderColor: themeColors.accentBorder }]}>
          <ThemedText style={styles.heroEyebrow}>Welcome to your engineering workspace</ThemedText>
          <ThemedText type="subtitle" style={styles.heroTitle}>
            Plan, document, and ship faster.
          </ThemedText>
        </View>
        {VALUE_PROPS.map((slide) => (
          <View key={slide.title} style={styles.slideWrap}>
            <ValuePropSlide {...slide} />
          </View>
        ))}
        <View style={styles.actions}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            disabled={isSaving}
            onPress={async () => {
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
                    client.from('profiles').update({ onboarding_completed: true }).eq('user_id', user.id),
                    client.from('users').update({ is_new_user: false }).eq('id', user.id),
                  ]),
                );

                if (profileUpdate.error) {
                  throw new Error(profileUpdate.error.message);
                }

                if (userUpdate.error) {
                  throw new Error(userUpdate.error.message);
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
            }}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.primaryButtonLabel}
              lightColor={themeColors.buttonPrimaryText}
              darkColor={themeColors.buttonPrimaryText}>
              {isSaving ? 'Finishing setup...' : 'Get started'}
            </ThemedText>
          </Pressable>
          {saveError ? (
            <ThemedText
              style={styles.errorText}
              lightColor={themeColors.error}
              darkColor={themeColors.error}>
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
  actions: {
    marginTop: 4,
    gap: 10,
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
