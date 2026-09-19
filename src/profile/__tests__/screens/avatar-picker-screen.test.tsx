import React from 'react';

import AvatarPickerScreen from '@/profile/screens/avatar-picker-screen';
import { renderWithProviders } from '@/testing/renderWithProviders';

describe('AvatarPickerScreen', () => {
  it('renders the avatar picker heading', async () => {
    const { getByText } = await renderWithProviders(<AvatarPickerScreen />);
    expect(getByText('Avatar Picker')).toBeTruthy();
  });
});
