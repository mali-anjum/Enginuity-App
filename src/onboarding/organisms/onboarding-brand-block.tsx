import { StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/onboarding/atoms/brand-logo';
import { ProgressDots } from '@/onboarding/atoms/progress-dots';

type OnboardingBrandBlockProps = {
  stepIndex: number;
  totalSteps: number;
};

export function OnboardingBrandBlock({ stepIndex, totalSteps }: OnboardingBrandBlockProps) {
  return (
    <View style={styles.block}>
      <BrandLogo />
      <ProgressDots total={totalSteps} activeIndex={stepIndex} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: 24,
    width: '100%',
  },
});
