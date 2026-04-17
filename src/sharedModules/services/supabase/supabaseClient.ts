import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { getSupabaseAnonKey, getSupabaseUrl } from '@/sharedModules/utils/env';
import type { Database } from '@/sharedModules/services/supabase/database.types';

const isWeb = Platform.OS === 'web';
const isBrowser = typeof window !== 'undefined';

const webStorage: SupportedStorage | undefined = isBrowser
  ? {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
    }
  : undefined;

export const supabase = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    persistSession: isWeb ? isBrowser : true,
    autoRefreshToken: isWeb ? isBrowser : true,
    detectSessionInUrl: isWeb,
    storage: isWeb ? webStorage : AsyncStorage,
  },
});
