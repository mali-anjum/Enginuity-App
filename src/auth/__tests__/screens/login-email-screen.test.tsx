import React from 'react';

import LoginEmailScreen from '@/auth/screens/login-email-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('LoginEmailScreen', () => {
  it('renders the login form', async () => {
    const { getByPlaceholderText } = await renderWithProviders(<LoginEmailScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });
});
