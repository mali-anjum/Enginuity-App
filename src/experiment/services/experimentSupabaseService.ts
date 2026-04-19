import type { SupabaseClient } from '@supabase/supabase-js';

import type { ExperimentStatus } from '@/experiment/constants';
import type { Experiment } from '@/experiment/state/experimentSlice';
import type { Database } from '@/sharedModules/services/supabase/database.types';
import { unwrapSupabaseClient } from '@/sharedModules/services/supabase/supabaseUntypedClient';
import { fetchAccessibleWorkspaceIds } from '@/sharedModules/services/supabase/workspaceService';

function mapRowToExperiment(
  row: Database['public']['Tables']['experiments']['Row'],
  hardwareIds: string[],
): Experiment {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    objective: row.objective ?? '',
    observations: row.observations ?? '',
    githubCommit: row.github_commit ?? '',
    status: row.status as ExperimentStatus,
    hardwareIds,
    attachmentUrls: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchHardwareLinksForExperiments(
  client: SupabaseClient<Database>,
  experimentIds: string[],
): Promise<Map<string, string[]>> {
  const sb = unwrapSupabaseClient(client);
  const map = new Map<string, string[]>();
  if (experimentIds.length === 0) return map;

  const { data, error } = await sb
    .from('experiment_hardware')
    .select('experiment_id, hardware_id')
    .in('experiment_id', experimentIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const list = map.get(row.experiment_id) ?? [];
    list.push(row.hardware_id);
    map.set(row.experiment_id, list);
  }
  return map;
}

export async function fetchExperimentsForUser(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<Experiment[]> {
  const sb = unwrapSupabaseClient(client);
  const workspaceIds = await fetchAccessibleWorkspaceIds(client, userId);
  if (workspaceIds.length === 0) return [];

  const { data: projects, error: pErr } = await sb
    .from('projects')
    .select('id')
    .in('workspace_id', workspaceIds);

  if (pErr) throw pErr;
  const projectIds = projects?.map((p) => p.id) ?? [];
  if (projectIds.length === 0) return [];

  const { data: experiments, error } = await sb
    .from('experiments')
    .select('*')
    .in('project_id', projectIds)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const expIds = (experiments ?? []).map((e) => e.id);
  const hwMap = await fetchHardwareLinksForExperiments(client, expIds);

  return (experiments ?? []).map((row) => mapRowToExperiment(row, hwMap.get(row.id) ?? []));
}

type CreateExperimentInput = Pick<Experiment, 'title' | 'projectId'> &
  Partial<
    Pick<
      Experiment,
      'objective' | 'observations' | 'githubCommit' | 'status' | 'hardwareIds' | 'attachmentUrls'
    >
  >;

export async function insertExperimentForUser(
  client: SupabaseClient<Database>,
  userId: string,
  input: CreateExperimentInput,
): Promise<Experiment> {
  const sb = unwrapSupabaseClient(client);
  const hardwareIds = input.hardwareIds ?? [];

  const insert: Database['public']['Tables']['experiments']['Insert'] = {
    project_id: input.projectId,
    owner_id: userId,
    title: input.title,
    objective: input.objective ?? '',
    observations: input.observations ?? '',
    github_commit: input.githubCommit?.trim() ? input.githubCommit : null,
    status: input.status ?? 'pending',
  };

  const { data, error } = await sb.from('experiments').insert(insert).select('*').single();
  if (error) throw error;

  if (hardwareIds.length > 0) {
    const { error: linkError } = await sb.from('experiment_hardware').insert(
      hardwareIds.map((hardware_id) => ({
        experiment_id: data.id,
        hardware_id,
        quantity_used: 1,
      })),
    );
    if (linkError) throw linkError;
  }

  return mapRowToExperiment(data, hardwareIds);
}

async function syncExperimentHardware(
  client: SupabaseClient<Database>,
  experimentId: string,
  hardwareIds: string[],
): Promise<void> {
  const sb = unwrapSupabaseClient(client);
  const { error: delErr } = await sb.from('experiment_hardware').delete().eq('experiment_id', experimentId);
  if (delErr) throw delErr;

  if (hardwareIds.length === 0) return;

  const { error } = await sb.from('experiment_hardware').insert(
    hardwareIds.map((hardware_id) => ({
      experiment_id: experimentId,
      hardware_id,
      quantity_used: 1,
    })),
  );
  if (error) throw error;
}

export async function updateExperimentForUser(
  client: SupabaseClient<Database>,
  experiment: Experiment,
): Promise<Experiment> {
  const sb = unwrapSupabaseClient(client);
  const { data, error } = await sb
    .from('experiments')
    .update({
      title: experiment.title,
      objective: experiment.objective || null,
      observations: experiment.observations || null,
      github_commit: experiment.githubCommit?.trim() ? experiment.githubCommit : null,
      status: experiment.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', experiment.id)
    .select('*')
    .single();

  if (error) throw error;

  await syncExperimentHardware(client, experiment.id, experiment.hardwareIds);

  return mapRowToExperiment(data, experiment.hardwareIds);
}

export async function patchExperimentStatusForUser(
  client: SupabaseClient<Database>,
  experimentId: string,
  status: ExperimentStatus,
): Promise<void> {
  const sb = unwrapSupabaseClient(client);
  const { error } = await sb
    .from('experiments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', experimentId);

  if (error) throw error;
}

export async function deleteExperimentForUser(
  client: SupabaseClient<Database>,
  experimentId: string,
): Promise<void> {
  const sb = unwrapSupabaseClient(client);
  const { error } = await sb.from('experiments').delete().eq('id', experimentId);
  if (error) throw error;
}
