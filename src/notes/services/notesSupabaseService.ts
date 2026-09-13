import type { SupabaseClient } from '@supabase/supabase-js';

import type { Note } from '@/notes/state/notesSlice';
import type { Database } from '@/sharedModules/services/supabase/database.types';
import { fetchAccessibleWorkspaceIds, getPersonalWorkspaceId } from '@/sharedModules/services/supabase/workspaceService';

type TagRow = { id: string; name: string };

function mapRowToNote(row: Database['public']['Tables']['notes']['Row'], tags: string[]): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body ?? '',
    projectId: row.project_id ?? null,
    experimentId: row.experiment_id ?? null,
    tags,
    isFavorite: row.is_favorite,
    linkedNoteIds: [],
    updatedAt: row.updated_at,
  };
}

async function resolveWorkspaceIdForNote(
  client: SupabaseClient<Database>,
  userId: string,
  projectId: string | null,
): Promise<string> {
  if (!projectId) {
    return getPersonalWorkspaceId(client, userId);
  }
  const { data, error } = await client.from('projects').select('workspace_id').eq('id', projectId).single();
  if (error || !data?.workspace_id) {
    return getPersonalWorkspaceId(client, userId);
  }
  return data.workspace_id;
}

async function upsertTagRows(
  client: SupabaseClient<Database>,
  workspaceId: string,
  tags: string[],
): Promise<TagRow[]> {
  const normalized = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
  if (normalized.length === 0) return [];
  const { error: upsertError } = await client.from('tags').upsert(
    normalized.map((name) => ({ workspace_id: workspaceId, name })),
    { onConflict: 'workspace_id,name' },
  );
  if (upsertError) throw upsertError;

  const { data, error } = await client.from('tags').select('id,name').eq('workspace_id', workspaceId).in('name', normalized);
  if (error) throw error;
  return (data ?? []) as TagRow[];
}

async function syncEntityTagsForNote(
  client: SupabaseClient<Database>,
  noteId: string,
  tags: string[],
  workspaceId: string,
): Promise<void> {
  const tagRows = await upsertTagRows(client, workspaceId, tags);

  const { error: deleteError } = await client
    .from('entity_tags')
    .delete()
    .eq('entity_type', 'note')
    .eq('entity_id', noteId);
  if (deleteError) throw deleteError;

  if (tagRows.length === 0) return;
  const { error: insertError } = await client.from('entity_tags').insert(
    tagRows.map((tag) => ({
      tag_id: tag.id,
      entity_type: 'note' as const,
      entity_id: noteId,
    })),
  );
  if (insertError) throw insertError;
}

async function fetchTagMapForNotes(
  client: SupabaseClient<Database>,
  noteIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (noteIds.length === 0) return map;

  const { data, error } = await client
    .from('entity_tags')
    .select('entity_id,tags(name)')
    .eq('entity_type', 'note')
    .in('entity_id', noteIds);
  if (error) throw error;

  for (const row of data ?? []) {
    const entityId = row.entity_id as string;
    const list = map.get(entityId) ?? [];
    const maybeName = (row.tags as { name?: string } | null)?.name;
    if (maybeName) list.push(maybeName);
    map.set(entityId, list);
  }
  return map;
}

export async function getAllNotes(client: SupabaseClient<Database>, userId: string): Promise<Note[]> {
  const workspaceIds = await fetchAccessibleWorkspaceIds(client, userId);

  const projectQuery = client.from('projects').select('id').in('workspace_id', workspaceIds);
  const { data: projects, error: projectError } = await projectQuery;
  if (projectError) throw projectError;
  const projectIds = (projects ?? []).map((project: { id: string }) => project.id);

  let noteQuery = client.from('notes').select('*').eq('owner_id', userId).order('updated_at', { ascending: false });
  if (projectIds.length > 0) {
    noteQuery = client
      .from('notes')
      .select('*')
      .or(`owner_id.eq.${userId},project_id.in.(${projectIds.join(',')})`)
      .order('updated_at', { ascending: false });
  }
  const { data: rows, error } = await noteQuery;
  if (error) throw error;

  const noteRows = (rows ?? []) as Database['public']['Tables']['notes']['Row'][];
  const tagMap = await fetchTagMapForNotes(client, noteRows.map((row) => row.id));
  return noteRows.map((row) => mapRowToNote(row, tagMap.get(row.id) ?? []));
}

export async function getNotesByProject(
  client: SupabaseClient<Database>,
  projectId: string,
): Promise<Note[]> {
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  const noteRows = (data ?? []) as Database['public']['Tables']['notes']['Row'][];
  const tagMap = await fetchTagMapForNotes(client, noteRows.map((row) => row.id));
  return noteRows.map((row) => mapRowToNote(row, tagMap.get(row.id) ?? []));
}

export async function getNotesByExperiment(
  client: SupabaseClient<Database>,
  experimentId: string,
): Promise<Note[]> {
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('experiment_id', experimentId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  const noteRows = (data ?? []) as Database['public']['Tables']['notes']['Row'][];
  const tagMap = await fetchTagMapForNotes(client, noteRows.map((row) => row.id));
  return noteRows.map((row) => mapRowToNote(row, tagMap.get(row.id) ?? []));
}

type SaveNoteInput = Pick<Note, 'title' | 'body' | 'projectId' | 'experimentId' | 'tags'> & {
  isFavorite?: boolean;
};

export async function createNote(
  client: SupabaseClient<Database>,
  userId: string,
  input: SaveNoteInput,
): Promise<Note> {
  const workspaceId = await resolveWorkspaceIdForNote(client, userId, input.projectId ?? null);
  const { data, error } = await client
    .from('notes')
    .insert({
      owner_id: userId,
      project_id: input.projectId ?? null,
      experiment_id: input.experimentId ?? null,
      title: input.title,
      body: input.body || null,
      is_favorite: Boolean(input.isFavorite),
    })
    .select('*')
    .single();
  if (error) throw error;

  await syncEntityTagsForNote(client, data.id, input.tags, workspaceId);
  return mapRowToNote(data as Database['public']['Tables']['notes']['Row'], input.tags);
}

export async function updateNote(
  client: SupabaseClient<Database>,
  userId: string,
  noteId: string,
  input: SaveNoteInput,
): Promise<Note> {
  const workspaceId = await resolveWorkspaceIdForNote(client, userId, input.projectId ?? null);
  const { data, error } = await client
    .from('notes')
    .update({
      project_id: input.projectId ?? null,
      experiment_id: input.experimentId ?? null,
      title: input.title,
      body: input.body || null,
      is_favorite: Boolean(input.isFavorite),
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select('*')
    .single();
  if (error) throw error;

  await syncEntityTagsForNote(client, noteId, input.tags, workspaceId);
  return mapRowToNote(data as Database['public']['Tables']['notes']['Row'], input.tags);
}

export async function removeNote(client: SupabaseClient<Database>, noteId: string): Promise<void> {
  const { error } = await client.from('notes').delete().eq('id', noteId);
  if (error) throw error;
}

export async function fetchTagUsageCounts(
  client: SupabaseClient<Database>,
  workspaceId: string,
): Promise<Array<{ tag: string; count: number }>> {
  const { data, error } = await client
    .from('tags')
    .select('id,name')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true });
  if (error) throw error;

  const tags = (data ?? []) as TagRow[];
  if (tags.length === 0) return [];

  const { data: entityRows, error: entityError } = await client
    .from('entity_tags')
    .select('tag_id')
    .eq('entity_type', 'note')
    .in('tag_id', tags.map((tag) => tag.id));
  if (entityError) throw entityError;

  const counter = new Map<string, number>();
  for (const tag of tags) counter.set(tag.id, 0);
  for (const row of entityRows ?? []) {
    const tagId = row.tag_id as string;
    counter.set(tagId, (counter.get(tagId) ?? 0) + 1);
  }

  return tags
    .map((tag) => ({ tag: tag.name, count: counter.get(tag.id) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
