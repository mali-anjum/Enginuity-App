import React from 'react';

import OAuthCallbackScreen from '@/auth/screens/oauth-callback-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('OAuthCallbackScreen', () => {
  it('renders a status heading while there is no auth code param', async () => {
    const { getByText } = await renderWithProviders(<OAuthCallbackScreen />);
    // With no `code` param and no error, the screen settles on the "return to login" info state.
    expect(getByText('Email confirmation complete')).toBeTruthy();
  });
});
