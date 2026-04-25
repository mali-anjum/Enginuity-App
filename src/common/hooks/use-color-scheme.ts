import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppSelector } from '@/store/hooks';
import { selectTheme } from '@/ui/state/uiSlice';

/**
 * Resolves light/dark from Redux theme preference (`uiSlice.theme`, persisted)
 * combined with the OS scheme when preference is `system`.
 */
export function useColorScheme(): 'light' | 'dark' {
  const preference = useAppSelector(selectTheme);
  const systemScheme = useRNColorScheme();
  if (preference === 'system') {
    return systemScheme ?? 'light';
  }
  return preference;
}
