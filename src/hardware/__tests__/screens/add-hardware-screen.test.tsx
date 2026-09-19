import React from 'react';

import AddHardwareScreen from '@/hardware/screens/add-hardware-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('AddHardwareScreen', () => {
  it('renders the add-hardware form', async () => {
    const { getByText } = await renderWithProviders(<AddHardwareScreen />);
    expect(getByText('Add Hardware')).toBeTruthy();
  });
});
