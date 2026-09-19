import React from 'react';

import NotesListScreen from '@/notes/screens/notes-list-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('NotesListScreen', () => {
  it('renders the empty state when there are no notes', async () => {
    const { getByText } = await renderWithProviders(<NotesListScreen />);
    expect(getByText('Capture your first engineering note')).toBeTruthy();
  });
});
