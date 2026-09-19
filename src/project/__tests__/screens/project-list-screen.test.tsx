import React from 'react';

import ProjectListScreen from '@/project/screens/project-list-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('ProjectListScreen', () => {
  it('renders the project list heading', async () => {
    const { getByText } = await renderWithProviders(<ProjectListScreen />);
    expect(getByText('Project List')).toBeTruthy();
  });
});
