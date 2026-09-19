import React from 'react';

import TagBrowserScreen from '@/notes/screens/tag-browser-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('TagBrowserScreen', () => {
  it('renders the tag browser heading', async () => {
    const { getByText } = await renderWithProviders(<TagBrowserScreen />);
    expect(getByText('Tag Browser')).toBeTruthy();
  });
});
