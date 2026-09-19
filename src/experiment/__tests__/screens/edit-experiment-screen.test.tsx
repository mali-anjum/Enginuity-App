import React from 'react';

import EditExperimentScreen from '@/experiment/screens/edit-experiment-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('EditExperimentScreen', () => {
  it('renders a not-found state when the experiment id param is missing', async () => {
    const { getByText } = await renderWithProviders(<EditExperimentScreen />);
    expect(getByText('Experiment not found.')).toBeTruthy();
  });
});
