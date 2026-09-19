import React from 'react';

import ExploreScreen from '@/common/screens/explore-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('ExploreScreen', () => {
  it('renders the explore hub sections', async () => {
    const { getByText } = await renderWithProviders(<ExploreScreen />);
    expect(getByText('Explore')).toBeTruthy();
    expect(getByText('Projects')).toBeTruthy();
    expect(getByText('Hardware Library')).toBeTruthy();
    expect(getByText('Browse by tag')).toBeTruthy();
    expect(getByText('Build your hardware library')).toBeTruthy();
  });

  it('renders hardware category counts when hardware exists', async () => {
    const { getByText } = await renderWithProviders(<ExploreScreen />, {
      preloadedState: {
        hardware: {
          hardware: [
            {
              id: 'hw-1',
              name: 'Arduino Uno',
              category: 'MCU',
              specs: '',
              datasheetUrl: '',
              updatedAt: new Date().toISOString(),
            },
          ],
          selectedHardwareId: null,
          filterByCategory: null,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(getByText('View all hardware')).toBeTruthy();
  });
});
