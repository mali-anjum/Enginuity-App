import React from 'react';

import OnboardingFocusScreen from '@/onboarding/screens/onboarding-focus-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('OnboardingFocusScreen', () => {
  it('renders the focus areas step', async () => {
    const { getByText } = await renderWithProviders(<OnboardingFocusScreen />);
    expect(getByText('Focus areas')).toBeTruthy();
  });
});
