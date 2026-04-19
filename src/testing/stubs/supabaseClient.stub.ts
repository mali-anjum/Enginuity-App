/**
 * Node/Jest stub — avoids importing React Native (get-random-values, AsyncStorage) when unit-testing slices.
 * Real client is unchanged at runtime in the app.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/sharedModules/services/supabase/database.types';

export class SupabaseNotInitializedError extends Error {
  constructor() {
    super('Supabase client has not been initialized yet.');
    this.name = 'SupabaseNotInitializedError';
  }
}

export function initializeSupabaseClient(): SupabaseClient<Database> {
  throw new SupabaseNotInitializedError();
}

export function getSupabaseClient(): SupabaseClient<Database> {
  throw new SupabaseNotInitializedError();
}

export function getSupabaseClientOrNull(): SupabaseClient<Database> | null {
  return null;
}

export async function withSupabaseClient<T>(
  action: (client: SupabaseClient<Database>) => Promise<T>,
  options?: { maxRetries?: number; baseDelayMs?: number; returnOnUnavailable?: T },
): Promise<T> {
  const client = getSupabaseClientOrNull();
  if (!client) {
    if (options && 'returnOnUnavailable' in options) {
      return options.returnOnUnavailable as T;
    }
    throw new SupabaseNotInitializedError();
  }
  return action(client);
}
