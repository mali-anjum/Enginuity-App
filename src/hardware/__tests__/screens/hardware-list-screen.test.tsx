import React from 'react';

import { renderWithProviders } from '@/testing/renderWithProviders';
import HardwareListScreen from '@/hardware/screens/hardware-list-screen';

describe('HardwareListScreen', () => {
  it('renders the empty state when there is no hardware', async () => {
    const { getByText } = await renderWithProviders(<HardwareListScreen />);

    expect(getByText('Hardware Library')).toBeTruthy();
    expect(getByText('Build your hardware library')).toBeTruthy();
  });

  it('renders hardware items from the store', async () => {
    const { getByText, queryByText } = await renderWithProviders(<HardwareListScreen />, {
      preloadedState: {
        hardware: {
          hardware: [
            {
              id: 'hw-1',
              name: 'Arduino Uno',
              category: 'MCU',
              specs: '5V, 16MHz',
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

    expect(getByText('Arduino Uno')).toBeTruthy();
    expect(queryByText('Build your hardware library')).toBeNull();
  });
});
