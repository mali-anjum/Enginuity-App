import React from 'react';

import ExperimentDetailScreen from '@/experiment/screens/experiment-detail-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('ExperimentDetailScreen', () => {
  it('renders a not-found state when the experiment id param is missing', async () => {
    const { getByText } = await renderWithProviders(<ExperimentDetailScreen />);
    expect(getByText('Experiment not found.')).toBeTruthy();
  });
});
