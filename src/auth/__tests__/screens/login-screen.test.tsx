import React from 'react';

import LoginScreen from '@/auth/screens/login-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('LoginScreen', () => {
  it('renders the welcome-back heading and continue-with-email option', async () => {
    const { getByText } = await renderWithProviders(<LoginScreen />);
    expect(getByText('Welcome back')).toBeTruthy();
    expect(getByText('Continue with email')).toBeTruthy();
  });
});
