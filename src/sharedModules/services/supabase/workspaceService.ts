import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/sharedModules/services/supabase/database.types';

type WorkspaceIdRow = { id: string };
type WorkspaceMemberIdRow = { workspace_id: string };

/**
 * Personal workspace is normally created by `handle_new_auth_user` on signup.
 * This resolves it for reads, and creates one (with membership) if missing.
 */
export async function getPersonalWorkspaceId(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  // Some older accounts can exist in auth.users but not yet in public.users.
  // Ensure the FK target exists before any workspace insert.
  const { data: authResult, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  const authUser = authResult.user;
  if (authUser?.id === userId) {
    const fullName =
      authUser.user_metadata?.full_name ??
      authUser.user_metadata?.name ??
      authUser.email?.split('@')[0] ??
      'New User';
    const email = authUser.email ?? `${userId}@placeholder.local`;
    const { error: userUpsertError } = await client
      .from('users')
      .upsert({ id: userId, email, full_name: fullName }, { onConflict: 'id' });
    if (userUpsertError) throw userUpsertError;
  }

  const { data: existing, error: findError } = await client
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .eq('is_personal', true)
    .order('created_at', { ascending: true })
    .limit(1);

  if (findError) throw findError;
  const existingRow = (existing as WorkspaceIdRow[] | null)?.[0] ?? null;
  if (existingRow?.id) {
    return existingRow.id;
  }

  const { data: created, error: wsError } = await client
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
  const createdRow = created as WorkspaceIdRow | null;
  if (!createdRow?.id) {
    throw new Error('Failed to create personal workspace.');
  }

  const { error: memberError } = await client.from('workspace_members').upsert(
    {
      workspace_id: createdRow.id,
      user_id: userId,
      role: 'admin',
    },
    { onConflict: 'workspace_id,user_id' },
  );

  if (memberError) throw memberError;

  return createdRow.id;
}

export async function fetchAccessibleWorkspaceIds(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<string[]> {
  const { data, error } = await client
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId);

  if (error) throw error;
  return ((data as WorkspaceMemberIdRow[] | null) ?? []).map((row) => row.workspace_id);
}
