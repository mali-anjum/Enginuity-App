import React from 'react';

import SignupEmailScreen from '@/auth/screens/signup-email-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('SignupEmailScreen', () => {
  it('renders the signup form fields', async () => {
    const { getByText, getByPlaceholderText } = await renderWithProviders(<SignupEmailScreen />);
    expect(getByText('Sign up with email')).toBeTruthy();
    expect(getByPlaceholderText('Full name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm password')).toBeTruthy();
  });
});
