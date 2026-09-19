import React from 'react';

import StorageSyncScreen from '@/settings/screens/storage-sync-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('StorageSyncScreen', () => {
  it('renders the storage & sync heading', async () => {
    const { getByText } = await renderWithProviders(<StorageSyncScreen />);
    expect(getByText('Storage & sync')).toBeTruthy();
  });
});
