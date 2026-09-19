import React from 'react';

import NotificationsScreen from '@/settings/screens/notifications-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('NotificationsScreen', () => {
  it('renders the notifications heading', async () => {
    const { getByText } = await renderWithProviders(<NotificationsScreen />);
    expect(getByText('Notifications')).toBeTruthy();
  });
});
