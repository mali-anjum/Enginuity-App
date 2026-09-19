import React from 'react';

import ProjectDetailScreen from '@/project/screens/project-detail-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('ProjectDetailScreen', () => {
  it('renders a not-found state when the project id param is missing', async () => {
    const { getByText } = await renderWithProviders(<ProjectDetailScreen />);
    expect(getByText('Project not found.')).toBeTruthy();
  });
});
