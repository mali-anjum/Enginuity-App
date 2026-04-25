import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/sharedModules/services/supabase/database.types';

/**
 * Hand-maintained `Database` uses `Update: Partial<Database['public']['Tables'][name]['Insert']>` which
 * self-references while `Database` is still being defined; PostgREST then infers `never` for mutations.
 */
export function unwrapSupabaseClient(client: SupabaseClient<Database>): SupabaseClient<unknown> {
  return client as unknown as SupabaseClient<unknown>;
}
