import React from 'react';

import AccountSettingsScreen from '@/settings/screens/account-settings-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('AccountSettingsScreen', () => {
  it('renders the account settings form', async () => {
    const { getByText, getByPlaceholderText } = await renderWithProviders(<AccountSettingsScreen />);
    expect(getByText('Account')).toBeTruthy();
    expect(getByPlaceholderText('New password')).toBeTruthy();
  });
});
