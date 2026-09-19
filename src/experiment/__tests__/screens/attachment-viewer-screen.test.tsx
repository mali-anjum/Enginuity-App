import React from 'react';

import AttachmentViewerScreen from '@/experiment/screens/attachment-viewer-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('AttachmentViewerScreen', () => {
  it('renders the viewer header with a default attachment name', async () => {
    const { getByText } = await renderWithProviders(<AttachmentViewerScreen />);
    expect(getByText('Attachment Viewer')).toBeTruthy();
    expect(getByText('Attachment')).toBeTruthy();
  });
});
