import type { SupabaseClient } from '@supabase/supabase-js';

import type { Project, ProjectStatus } from '@/project/state/projectSlice';
import type { Database } from '@/sharedModules/services/supabase/database.types';
import {
  fetchAccessibleWorkspaceIds,
  getPersonalWorkspaceId,
} from '@/sharedModules/services/supabase/workspaceService';
import { unwrapSupabaseClient } from '@/sharedModules/services/supabase/supabaseUntypedClient';

function mapRowToProject(row: Database['public']['Tables']['projects']['Row']): Project {
  const status: ProjectStatus = row.archived ? 'archived' : row.status;
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    ownerId: row.owner_id,
    ownerAvatarUrl: null,
    accessRole: 'admin',
    sharedWithMe: false,
    title: row.title,
    description: row.description ?? '',
    startDate: row.start_date ? row.start_date.slice(0, 10) : null,
    dueDate: row.due_date ? row.due_date.slice(0, 10) : null,
    status,
    fileUrls: [],
    isCompleted: row.status === 'completed',
    isFavourite: row.is_favorite,
    pendingSync: false,
    updatedAt: row.updated_at,
  };
}

function dateToIsoBoundary(dateStr: string | null): string | null {
  if (!dateStr?.trim()) return null;
  const parsed = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function projectToDbPatch(project: Project) {
  const dbStatus: Database['public']['Enums']['project_status'] =
    project.status === 'archived'
      ? 'archived'
      : project.status === 'completed'
        ? 'completed'
        : 'active';

  return {
    title: project.title,
    description: project.description || null,
    status: dbStatus,
    archived: project.status === 'archived',
    start_date: dateToIsoBoundary(project.startDate),
    due_date: dateToIsoBoundary(project.dueDate),
    is_favorite: project.isFavourite,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchProjectsForUser(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<Project[]> {
  const sb = unwrapSupabaseClient(client);
  const workspaceIds = await fetchAccessibleWorkspaceIds(client, userId);
  if (workspaceIds.length === 0) return [];

  const { data: membershipRows, error: membershipError } = await sb
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', userId)
    .in('workspace_id', workspaceIds);
  if (membershipError) throw membershipError;
  const roleByWorkspace = new Map(
    (membershipRows ?? []).map((row: { workspace_id: string; role: 'admin' | 'member' | 'viewer' }) => [
      row.workspace_id,
      row.role,
    ]),
  );

  const { data, error } = await sb
    .from('projects')
    .select('*')
    .in('workspace_id', workspaceIds)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  const ownerIds = Array.from(new Set((data ?? []).map((row) => row.owner_id)));
  const { data: profileRows, error: profileError } = await sb
    .from('profiles')
    .select('user_id, avatar_url')
    .in('user_id', ownerIds);
  if (profileError) throw profileError;
  const avatarByUserId = new Map(
    (profileRows ?? []).map((row: { user_id: string; avatar_url: string | null }) => [
      row.user_id,
      row.avatar_url,
    ]),
  );

  return (data ?? []).map((row) => {
    const mapped = mapRowToProject(row);
    const role = roleByWorkspace.get(row.workspace_id) ?? 'viewer';
    return {
      ...mapped,
      accessRole: role,
      sharedWithMe: row.owner_id !== userId,
      ownerAvatarUrl: avatarByUserId.get(row.owner_id) ?? null,
    };
  });
}

type CreateProjectInput = Pick<Project, 'title'> &
  Partial<Pick<Project, 'description' | 'startDate' | 'dueDate' | 'status'>>;

export async function insertProjectForUser(
  client: SupabaseClient<Database>,
  userId: string,
  input: CreateProjectInput,
): Promise<Project> {
  const sb = unwrapSupabaseClient(client);
  const workspaceId = await getPersonalWorkspaceId(client, userId);
  const status = input.status ?? 'active';
  const dbStatus: Database['public']['Enums']['project_status'] =
    status === 'archived' ? 'archived' : status === 'completed' ? 'completed' : 'active';

  const insert: Database['public']['Tables']['projects']['Insert'] = {
    workspace_id: workspaceId,
    owner_id: userId,
    title: input.title,
    description: input.description ?? '',
    status: dbStatus,
    archived: status === 'archived',
    start_date: dateToIsoBoundary(input.startDate ?? null),
    due_date: dateToIsoBoundary(input.dueDate ?? null),
    is_favorite: false,
  };

  const { data, error } = await sb.from('projects').insert(insert).select('*').single();
  if (error) throw error;
  const project = mapRowToProject(data);
  return { ...project, accessRole: 'admin', sharedWithMe: false, ownerAvatarUrl: null };
}

export async function updateProjectForUser(
  client: SupabaseClient<Database>,
  project: Project,
): Promise<Project> {
  const sb = unwrapSupabaseClient(client);
  const { data, error } = await sb
    .from('projects')
    .update(projectToDbPatch(project))
    .eq('id', project.id)
    .select('*')
    .single();

  if (error) throw error;
  return mapRowToProject(data);
}

export async function deleteProjectForUser(
  client: SupabaseClient<Database>,
  projectId: string,
): Promise<void> {
  const sb = unwrapSupabaseClient(client);
  const { error } = await sb.from('projects').delete().eq('id', projectId);
  if (error) throw error;
}
