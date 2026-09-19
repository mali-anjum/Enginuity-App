import React from 'react';

import NoteDetailScreen from '@/notes/screens/note-detail-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('NoteDetailScreen', () => {
  it('renders a not-found state when the note id param is missing', async () => {
    const { getByText } = await renderWithProviders(<NoteDetailScreen />);
    expect(getByText('Note not found.')).toBeTruthy();
  });
});
