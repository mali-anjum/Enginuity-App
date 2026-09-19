import React from 'react';

import OnboardingGoalsScreen from '@/onboarding/screens/onboarding-goals-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('OnboardingGoalsScreen', () => {
  it('renders the goals step', async () => {
    const { getByText } = await renderWithProviders(<OnboardingGoalsScreen />);
    expect(getByText('Goals')).toBeTruthy();
  });
});
