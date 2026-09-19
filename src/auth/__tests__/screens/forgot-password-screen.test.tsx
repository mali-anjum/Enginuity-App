import React from 'react';

import ForgotPasswordScreen from '@/auth/screens/forgot-password-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('ForgotPasswordScreen', () => {
  it('renders the forgot-password form', async () => {
    const { getByText, getByPlaceholderText } = await renderWithProviders(<ForgotPasswordScreen />);
    expect(getByText('Forgot password')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByText('Back to sign in')).toBeTruthy();
  });
});
