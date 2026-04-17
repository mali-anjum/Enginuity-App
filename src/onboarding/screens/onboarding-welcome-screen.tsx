import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ValuePropSlide } from '@/onboarding/molecules/value-prop-slide';
import { OnboardingBrandBlock } from '@/onboarding/organisms/onboarding-brand-block';
import { completeOnboarding } from '@/onboarding/state/onboardingSlice';
import { useAppDispatch } from '@/sharedModules/state/hooks';

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
  const router = useRouter();
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
            onPress={() => {
              dispatch(completeOnboarding());
              router.replace('/auth/login');
            }}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.primaryButtonLabel}
              lightColor={themeColors.buttonPrimaryText}
              darkColor={themeColors.buttonPrimaryText}>
              Get started
            </ThemedText>
          </Pressable>
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
});
