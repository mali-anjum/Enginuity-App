import React from 'react';

import SearchResultsScreen from '@/search/screens/search-results-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('SearchResultsScreen', () => {
  it('renders the search results heading', async () => {
    const { getByText } = await renderWithProviders(<SearchResultsScreen />);
    expect(getByText('Search Results')).toBeTruthy();
  });
});
