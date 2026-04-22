import type { SupabaseClient } from '@supabase/supabase-js';

import { unwrapSupabaseClient } from '@/sharedModules/services/supabase/supabaseUntypedClient';

export type ShareRole = 'owner' | 'editor' | 'viewer';

function toWorkspaceMemberRole(role: ShareRole): 'admin' | 'member' | 'viewer' {
  if (role === 'owner') return 'admin';
  if (role === 'editor') return 'member';
  return 'viewer';
}

export async function sendProjectInviteEmail(
  client: SupabaseClient,
  input: { projectId: string; email: string; role: ShareRole },
): Promise<void> {
  const sb = unwrapSupabaseClient(client);
  const { error } = await sb.functions.invoke('invite-project-member', {
    body: {
      projectId: input.projectId,
      email: input.email,
      role: toWorkspaceMemberRole(input.role),
    },
  });
  if (error) throw new Error(error.message);
}
