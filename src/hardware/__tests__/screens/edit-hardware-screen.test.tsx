import React from 'react';

import EditHardwareScreen from '@/hardware/screens/edit-hardware-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('EditHardwareScreen', () => {
  it('renders a not-found state when the hardware id param is missing', async () => {
    const { getByText } = await renderWithProviders(<EditHardwareScreen />);
    expect(getByText('Hardware item not found.')).toBeTruthy();
  });
});
