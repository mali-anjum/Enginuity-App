import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppButton } from "@/common/atoms/app-button";
import { ThemedText } from "@/common/atoms/themed-text";
import { Colors, Radii, Spacing } from "@/common/constants/theme";
import { useColorScheme } from "@/common/hooks/use-color-scheme";
import { ScreenContainer } from "@/common/molecules/screen-container";
import { setIntroSlideIndex } from "@/onboarding/state/onboardingSlice";
import { ValuePropSlide } from "@/onboarding/molecules/value-prop-slide";
import { OnboardingBrandBlock } from "@/onboarding/organisms/onboarding-brand-block";
import { ROUTES } from "@/sharedModules/navigation/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const SLIDES = [
  {
    emoji: "📁",
    title: "Organise engineering projects",
    description:
      "Keep experiments, hardware, and notes aligned so nothing gets lost between iterations.",
  },
  {
    emoji: "🧪",
    title: "Log experiments with context",
    description:
      "Attach hardware, CSVs, and outcomes so comparisons stay meaningful.",
  },
  {
    emoji: "🎯",
    title: "Built for how you actually work",
    description:
      "Next, tell us about your study context and habits—we use it only to tune your experience.",
  },
] as const;

export default function OnboardingIntroScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];
  const stepIndex = useAppSelector((state) => state.onboarding.introSlideIndex);
  const isLast = stepIndex === SLIDES.length - 1;

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <OnboardingBrandBlock
          stepIndex={stepIndex}
          totalSteps={SLIDES.length + 5}
        />
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: themeColors.heroTint,
              borderColor: themeColors.accentBorder,
            },
          ]}
        >
          <ThemedText type="eyebrow" style={{ color: themeColors.mutedText }}>
            Enginuity
          </ThemedText>
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
            <AppButton
              label="Back"
              variant="secondary"
              onPress={() => dispatch(setIntroSlideIndex(Math.max(0, stepIndex - 1)))}
            />
          ) : null}
          <AppButton
            label={isLast ? "Continue" : "Next"}
            onPress={() => {
              if (!isLast) {
                dispatch(setIntroSlideIndex(stepIndex + 1));
                return;
              }
              router.push(ROUTES.ONBOARDING_FOCUS as never);
            }}
          />
        </View>
        <Pressable
          onPress={() => router.replace(ROUTES.AUTH_LOGIN as never)}
          style={styles.skipWrap}
        >
          <ThemedText type="link">Already have an account? Sign in</ThemedText>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    padding: Spacing.xxl,
    gap: Spacing.lg + 2,
    paddingBottom: Spacing.xxxl + Spacing.lg,
  },
  heroCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.lg + 2,
    gap: Spacing.xs + 2,
  },
  heroTitle: { lineHeight: 28 },
  slideWrap: { width: "100%" },
  actions: { gap: Spacing.sm + 2 },
  skipWrap: { alignItems: "center", marginTop: Spacing.sm },
});
