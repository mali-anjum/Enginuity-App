import React from 'react';

import AccountStatisticsScreen from '@/profile/screens/account-statistics-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('AccountStatisticsScreen', () => {
  it('renders the account statistics heading', async () => {
    const { getByText } = await renderWithProviders(<AccountStatisticsScreen />);
    expect(getByText('Account Statistics')).toBeTruthy();
  });
});
