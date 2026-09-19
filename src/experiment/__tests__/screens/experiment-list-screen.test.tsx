import React from 'react';

import ExperimentListScreen from '@/experiment/screens/experiment-list-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('ExperimentListScreen', () => {
  it('renders the empty state when there are no experiments', async () => {
    const { getByText } = await renderWithProviders(<ExperimentListScreen />);
    expect(getByText('Run your first experiment')).toBeTruthy();
  });
});
