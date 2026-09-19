import React from 'react';

import EditProfileScreen from '@/profile/screens/edit-profile-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('EditProfileScreen', () => {
  it('renders the edit profile form', async () => {
    const { getByText, getByPlaceholderText } = await renderWithProviders(<EditProfileScreen />);
    expect(getByText('Edit Profile')).toBeTruthy();
    expect(getByPlaceholderText('Full name')).toBeTruthy();
  });
});
