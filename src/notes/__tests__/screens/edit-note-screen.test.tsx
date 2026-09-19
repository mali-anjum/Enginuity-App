import React from 'react';

import EditNoteScreen from '@/notes/screens/edit-note-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('EditNoteScreen', () => {
  it('renders a not-found state when the note id param is missing', async () => {
    const { getByText } = await renderWithProviders(<EditNoteScreen />);
    expect(getByText('Note not found.')).toBeTruthy();
  });
});
