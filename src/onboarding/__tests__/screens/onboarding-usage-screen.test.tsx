import React from 'react';

import OnboardingUsageScreen from '@/onboarding/screens/onboarding-usage-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('OnboardingUsageScreen', () => {
  it('renders the usage step', async () => {
    const { getByText } = await renderWithProviders(<OnboardingUsageScreen />);
    expect(getByText('When & where you use Enginuity')).toBeTruthy();
  });
});
