import React from 'react';

import ResetPasswordScreen from '@/auth/screens/reset-password-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('ResetPasswordScreen', () => {
  it('renders the reset-password form', async () => {
    const { getAllByText, getByPlaceholderText } = await renderWithProviders(<ResetPasswordScreen />);
    expect(getAllByText('Reset password').length).toBeGreaterThan(0);
    expect(getByPlaceholderText('New password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm new password')).toBeTruthy();
  });
});
