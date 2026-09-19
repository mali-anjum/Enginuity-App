import React from 'react';

import AboutScreen from '@/settings/screens/about-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('AboutScreen', () => {
  it('renders the about heading', async () => {
    const { getByText } = await renderWithProviders(<AboutScreen />);
    expect(getByText('About')).toBeTruthy();
  });
});
