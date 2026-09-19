import React from 'react';

import SignupScreen from '@/auth/screens/signup-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('SignupScreen', () => {
  it('renders the create-account heading and continue-with-email option', async () => {
    const { getByText } = await renderWithProviders(<SignupScreen />);
    expect(getByText('Create account')).toBeTruthy();
    expect(getByText('Continue with email')).toBeTruthy();
  });
});
