import React from 'react';

import CsvDataPreviewScreen from '@/experiment/screens/csv-data-preview-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('CsvDataPreviewScreen', () => {
  it('renders the empty state when there is no csv url param', async () => {
    const { getByText } = await renderWithProviders(<CsvDataPreviewScreen />);
    expect(getByText('CSV Data Preview')).toBeTruthy();
    expect(getByText('No CSV rows found.')).toBeTruthy();
  });
});
