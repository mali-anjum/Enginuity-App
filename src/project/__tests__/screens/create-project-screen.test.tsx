import React from 'react';

import CreateProjectScreen from '@/project/screens/create-project-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('CreateProjectScreen', () => {
  it('renders the create-project form', async () => {
    const { getByText } = await renderWithProviders(<CreateProjectScreen />);
    expect(getByText('Create Project')).toBeTruthy();
  });
});
