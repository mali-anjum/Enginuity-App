import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient, type SupportedStorage } from '@supabase/supabase-js';
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

const DEFAULT_BASE_DELAY_MS = 250;
const DEFAULT_MAX_RETRIES = 5;

export class SupabaseNotInitializedError extends Error {
  constructor() {
    super('Supabase client has not been initialized yet.');
    this.name = 'SupabaseNotInitializedError';
  }
}

let supabaseClient: SupabaseClient<Database> | null = null;

export function initializeSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: isWeb ? isBrowser : true,
      autoRefreshToken: isWeb ? isBrowser : true,
      detectSessionInUrl: isWeb,
      storage: isWeb ? webStorage : AsyncStorage,
    },
  });

  return supabaseClient;
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    throw new SupabaseNotInitializedError();
  }
  return supabaseClient;
}

export function getSupabaseClientOrNull(): SupabaseClient<Database> | null {
  return supabaseClient;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withSupabaseClient<T>(
  action: (client: SupabaseClient<Database>) => Promise<T>,
  options?: { maxRetries?: number; baseDelayMs?: number; returnOnUnavailable?: T },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  let attempt = 0;

  while (attempt <= maxRetries) {
    const client = getSupabaseClientOrNull();
    if (!client) {
      if (attempt === maxRetries) {
        if (options && 'returnOnUnavailable' in options) {
          return options.returnOnUnavailable as T;
        }
        throw new SupabaseNotInitializedError();
      }

      await delay(baseDelayMs * 2 ** attempt);
      attempt += 1;
      continue;
    }

    try {
      return await action(client);
    } catch (error) {
      if (error instanceof SupabaseNotInitializedError && attempt < maxRetries) {
        await delay(baseDelayMs * 2 ** attempt);
        attempt += 1;
        continue;
      }
      throw error;
    }
  }

  if (options && 'returnOnUnavailable' in options) {
    return options.returnOnUnavailable as T;
  }
  throw new SupabaseNotInitializedError();
}
