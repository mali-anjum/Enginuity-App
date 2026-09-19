import React from 'react';

import OnboardingIntroScreen from '@/onboarding/screens/onboarding-intro-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('OnboardingIntroScreen', () => {
  it('renders the intro hero and first slide', async () => {
    const { getByText, getAllByText } = await renderWithProviders(<OnboardingIntroScreen />);
    expect(getAllByText('Enginuity').length).toBeGreaterThan(0);
    expect(getByText('Your workspace for labs, builds, and study notes.')).toBeTruthy();
    expect(getByText('Next')).toBeTruthy();
  });
});
