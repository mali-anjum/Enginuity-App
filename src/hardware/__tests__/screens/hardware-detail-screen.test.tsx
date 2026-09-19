import React from 'react';

import HardwareDetailScreen from '@/hardware/screens/hardware-detail-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('HardwareDetailScreen', () => {
  it('renders a not-found state when the hardware id param is missing', async () => {
    const { getByText } = await renderWithProviders(<HardwareDetailScreen />);
    expect(getByText('Hardware item not found.')).toBeTruthy();
  });
});
