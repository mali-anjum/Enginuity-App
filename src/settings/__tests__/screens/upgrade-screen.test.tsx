import React from 'react';

import UpgradeScreen from '@/settings/screens/upgrade-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('UpgradeScreen', () => {
  it('renders the upgrade heading', async () => {
    const { getByText } = await renderWithProviders(<UpgradeScreen />);
    expect(getByText('Upgrade to Pro')).toBeTruthy();
  });
});
