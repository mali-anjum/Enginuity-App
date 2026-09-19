import React from 'react';

import ModalScreen from '@/common/screens/modal-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('ModalScreen', () => {
  it('renders the modal content and home link', async () => {
    const { getByText } = await renderWithProviders(<ModalScreen />);
    expect(getByText('This is a modal')).toBeTruthy();
    expect(getByText('Go to home screen')).toBeTruthy();
  });
});
