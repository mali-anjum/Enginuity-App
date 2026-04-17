import type { AuthDiscipline } from '@/auth/state/authSlice';

export const AUTH_DISCIPLINE_OPTIONS: { value: AuthDiscipline; label: string }[] = [
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'civil', label: 'Civil' },
  { value: 'software', label: 'Software' },
  { value: 'chemical', label: 'Chemical' },
  { value: 'other', label: 'Other' },
];
