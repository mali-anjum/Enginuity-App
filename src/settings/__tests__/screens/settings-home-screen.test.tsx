import React from 'react';

import SettingsHomeScreen from '@/settings/screens/settings-home-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('SettingsHomeScreen', () => {
  it('renders the settings heading', async () => {
    const { getByText } = await renderWithProviders(<SettingsHomeScreen />);
    expect(getByText('Settings')).toBeTruthy();
  });
});
