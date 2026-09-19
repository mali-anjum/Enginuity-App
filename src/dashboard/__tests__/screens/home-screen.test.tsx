import React from 'react';

import HomeScreen from '@/dashboard/screens/home-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('HomeScreen', () => {
  it('renders the projects and activity feed sections', async () => {
    const { getByText } = await renderWithProviders(<HomeScreen />);
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Projects')).toBeTruthy();
    expect(getByText('Activity feed')).toBeTruthy();
  });
});
