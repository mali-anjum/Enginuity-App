import React from 'react';

import OnboardingEducationScreen from '@/onboarding/screens/onboarding-education-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('OnboardingEducationScreen', () => {
  it('renders the education & affiliation step', async () => {
    const { getByText } = await renderWithProviders(<OnboardingEducationScreen />);
    expect(getByText('Education & affiliation')).toBeTruthy();
  });
});
