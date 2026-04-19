import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/sharedModules/services/supabase/database.types';
import { unwrapSupabaseClient } from '@/sharedModules/services/supabase/supabaseUntypedClient';

/**
 * Personal workspace is normally created by `handle_new_auth_user` on signup.
 * This resolves it for reads, and creates one (with membership) if missing.
 */
export async function getPersonalWorkspaceId(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  const sb = unwrapSupabaseClient(client);
  const { data: existing, error: findError } = await sb
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .eq('is_personal', true)
    .maybeSingle();

  if (findError) throw findError;
  if (existing?.id) return existing.id;

  const { data: created, error: wsError } = await sb
    .from('workspaces')
    .insert({
      owner_id: userId,
      name: 'My Workspace',
      description: 'Personal workspace',
      is_personal: true,
    })
    .select('id')
    .single();

  if (wsError) throw wsError;

  const { error: memberError } = await sb.from('workspace_members').insert({
    workspace_id: created.id,
    user_id: userId,
    role: 'admin',
  });

  if (memberError) throw memberError;

  return created.id;
}

export async function fetchAccessibleWorkspaceIds(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<string[]> {
  const sb = unwrapSupabaseClient(client);
  const { data, error } = await sb
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data?.map((row) => row.workspace_id) ?? [];
}
