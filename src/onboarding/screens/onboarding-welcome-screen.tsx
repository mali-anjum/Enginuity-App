import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { ValuePropSlide } from '@/onboarding/molecules/value-prop-slide';
import { OnboardingBrandBlock } from '@/onboarding/organisms/onboarding-brand-block';

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
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <OnboardingBrandBlock stepIndex={0} totalSteps={VALUE_PROPS.length} />
        {VALUE_PROPS.map((slide) => (
          <View key={slide.title} style={styles.slideWrap}>
            <ValuePropSlide {...slide} />
          </View>
        ))}
        <ThemedText style={styles.footer}>Next: discipline selection → auth (wired in routes later).</ThemedText>
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
  slideWrap: {
    width: '100%',
  },
  footer: {
    marginTop: 8,
    opacity: 0.7,
    fontSize: 13,
  },
});
