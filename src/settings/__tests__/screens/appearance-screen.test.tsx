import React from 'react';

import AppearanceScreen from '@/settings/screens/appearance-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('AppearanceScreen', () => {
  it('renders the appearance heading', async () => {
    const { getByText } = await renderWithProviders(<AppearanceScreen />);
    expect(getByText('Appearance')).toBeTruthy();
  });
});
