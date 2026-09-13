import type { SupabaseClient } from '@supabase/supabase-js';

import { colorForTag, SEEDED_ENGINEERING_TAGS } from '@/sharedModules/constants/engineering-tags';
import type { Database } from '@/sharedModules/services/supabase/database.types';

export async function seedEngineeringTagsForWorkspace(
  client: SupabaseClient<Database>,
  workspaceId: string,
): Promise<void> {
  const payload = SEEDED_ENGINEERING_TAGS.map((name) => ({
    workspace_id: workspaceId,
    name,
    color: colorForTag(name),
  }));
  const { error } = await client.from('tags').upsert(payload, { onConflict: 'workspace_id,name' });
  if (error) throw error;
}

export async function upsertWorkspaceTags(
  client: SupabaseClient<Database>,
  workspaceId: string,
  tagNames: string[],
): Promise<void> {
  const normalized = Array.from(new Set(tagNames.map((tag) => tag.trim()).filter(Boolean)));
  if (normalized.length === 0) return;
  const payload = normalized.map((name) => ({
    workspace_id: workspaceId,
    name,
    color: colorForTag(name),
  }));
  const { error } = await client.from('tags').upsert(payload, { onConflict: 'workspace_id,name' });
  if (error) throw error;
}
