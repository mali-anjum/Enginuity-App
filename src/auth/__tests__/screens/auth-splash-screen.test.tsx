import React from 'react';

import AuthSplashScreen from '@/auth/screens/auth-splash-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('AuthSplashScreen', () => {
  it('renders the checking-session message', async () => {
    const { getByText } = await renderWithProviders(<AuthSplashScreen />);
    expect(getByText('Checking session...')).toBeTruthy();
  });
});
