import React from 'react';

import CreateNoteScreen from '@/notes/screens/create-note-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('CreateNoteScreen', () => {
  it('renders the create-note form', async () => {
    const { getByText } = await renderWithProviders(<CreateNoteScreen />);
    expect(getByText('Create Note')).toBeTruthy();
  });
});
