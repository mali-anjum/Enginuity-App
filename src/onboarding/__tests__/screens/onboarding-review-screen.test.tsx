import React from 'react';

import OnboardingReviewScreen from '@/onboarding/screens/onboarding-review-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('OnboardingReviewScreen', () => {
  it('renders the review step', async () => {
    const { getByText } = await renderWithProviders(<OnboardingReviewScreen />);
    expect(getByText('Save my plan')).toBeTruthy();
  });
});
