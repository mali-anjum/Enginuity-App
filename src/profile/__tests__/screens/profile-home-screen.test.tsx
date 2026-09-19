import React from 'react';

import ProfileHomeScreen from '@/profile/screens/profile-home-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('ProfileHomeScreen', () => {
  it('renders the profile heading', async () => {
    const { getByText } = await renderWithProviders(<ProfileHomeScreen />);
    expect(getByText('Profile')).toBeTruthy();
  });
});
