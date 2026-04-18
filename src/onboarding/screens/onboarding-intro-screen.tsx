import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ValuePropSlide } from '@/onboarding/molecules/value-prop-slide';
import { OnboardingBrandBlock } from '@/onboarding/organisms/onboarding-brand-block';

const SLIDES = [
  {
    emoji: '📁',
    title: 'Organise engineering projects',
    description: 'Keep experiments, hardware, and notes aligned so nothing gets lost between iterations.',
  },
  {
    emoji: '🧪',
    title: 'Log experiments with context',
    description: 'Attach hardware, CSVs, and outcomes so comparisons stay meaningful.',
  },
  {
    emoji: '🎯',
    title: 'Built for how you actually work',
    description: 'Next, tell us about your study context and habits—we use it only to tune your experience.',
  },
] as const;

export default function OnboardingIntroScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [stepIndex, setStepIndex] = useState(0);
  const isLast = stepIndex === SLIDES.length - 1;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <OnboardingBrandBlock stepIndex={stepIndex} totalSteps={SLIDES.length + 5} />
        <View style={[styles.heroCard, { backgroundColor: themeColors.heroTint, borderColor: themeColors.accentBorder }]}>
          <ThemedText style={styles.heroEyebrow}>Enginuity</ThemedText>
          <ThemedText type="subtitle" style={styles.heroTitle}>
            Your workspace for labs, builds, and study notes.
          </ThemedText>
        </View>
        <View style={styles.slideWrap}>
          <ValuePropSlide
            emoji={SLIDES[stepIndex].emoji}
            title={SLIDES[stepIndex].title}
            description={SLIDES[stepIndex].description}
          />
        </View>
        <View style={styles.actions}>
          {stepIndex > 0 ? (
            <Pressable
              style={[styles.secondaryButton, { borderColor: themeColors.border }]}
              onPress={() => setStepIndex((s) => Math.max(0, s - 1))}>
              <ThemedText style={{ color: themeColors.mutedText }}>Back</ThemedText>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            onPress={() => {
              if (!isLast) {
                setStepIndex((s) => s + 1);
                return;
              }
              router.push('/onboarding/focus' as never);
            }}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.primaryLabel}
              lightColor={themeColors.buttonPrimaryText}
              darkColor={themeColors.buttonPrimaryText}>
              {isLast ? 'Continue' : 'Next'}
            </ThemedText>
          </Pressable>
        </View>
        <Pressable onPress={() => router.replace('/auth/login' as never)} style={styles.skipWrap}>
          <ThemedText type="link">Already have an account? Sign in</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: 24, gap: 18, paddingBottom: 48 },
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
  heroTitle: { lineHeight: 28 },
  slideWrap: { width: '100%' },
  actions: { gap: 10 },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryLabel: { fontSize: 16 },
  skipWrap: { alignItems: 'center', marginTop: 8 },
});
