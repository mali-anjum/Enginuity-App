import React from 'react';

import EditProjectScreen from '@/project/screens/edit-project-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('EditProjectScreen', () => {
  it('renders a not-found state when the project id param is missing', async () => {
    const { getByText } = await renderWithProviders(<EditProjectScreen />);
    expect(getByText('Project not found.')).toBeTruthy();
  });
});
