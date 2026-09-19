import React from 'react';

import GlobalSearchScreen from '@/search/screens/global-search-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('GlobalSearchScreen', () => {
  it('renders the search input', async () => {
    const { getByText, getByPlaceholderText } = await renderWithProviders(<GlobalSearchScreen />);
    expect(getByText('Global Search')).toBeTruthy();
    expect(getByPlaceholderText('Start typing...')).toBeTruthy();
  });
});
