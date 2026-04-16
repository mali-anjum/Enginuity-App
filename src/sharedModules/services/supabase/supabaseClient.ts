import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { getSupabaseAnonKey, getSupabaseUrl } from '@/sharedModules/utils/env';

const isWeb = Platform.OS === 'web';
const isBrowser = typeof window !== 'undefined';

const webStorage = isBrowser
  ? {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
    }
  : undefined;

export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    persistSession: isWeb ? isBrowser : true,
    autoRefreshToken: isWeb ? isBrowser : true,
    detectSessionInUrl: false,
    storage: isWeb ? webStorage : AsyncStorage,
  },
});
