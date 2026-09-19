import React from 'react';

import CreateExperimentScreen from '@/experiment/screens/create-experiment-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('CreateExperimentScreen', () => {
  it('renders the create-experiment form', async () => {
    const { getByText } = await renderWithProviders(<CreateExperimentScreen />);
    expect(getByText('Create Experiment')).toBeTruthy();
  });
});
