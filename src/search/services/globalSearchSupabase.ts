import { withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';

export type GlobalSearchEntityRow = {
  entity_type: string;
  entity_id: string;
  title: string;
  rank: number;
};

export async function fetchGlobalSearchEntities(params: {
  searchQuery: string;
  filterProjectId?: string;
  filterStatus?: string;
  filterHardwareId?: string;
  filterTag?: string;
  dateFrom?: string;
  dateTo?: string;
  resultLimit?: number;
}): Promise<GlobalSearchEntityRow[]> {
  const q = params.searchQuery.trim();
  if (!q) {
    return [];
  }

  return withSupabaseClient(
    async (client) => {
      const { data, error } = await client.rpc('global_search_entities', {
        search_query: q,
        filter_project_id: params.filterProjectId || null,
        filter_status: params.filterStatus || null,
        filter_hardware_id: params.filterHardwareId || null,
        filter_tag: params.filterTag || null,
        date_from: params.dateFrom || null,
        date_to: params.dateTo || null,
        result_limit: params.resultLimit ?? 80,
      });
      if (error) {
        return [];
      }
      return (data ?? []) as GlobalSearchEntityRow[];
    },
    { returnOnUnavailable: [] },
  );
}

export function aggregateGlobalSearchCounts(rows: GlobalSearchEntityRow[]) {
  let projects = 0;
  let experiments = 0;
  let notes = 0;
  for (const row of rows) {
    if (row.entity_type === 'project') {
      projects += 1;
    } else if (row.entity_type === 'experiment') {
      experiments += 1;
    } else if (row.entity_type === 'note') {
      notes += 1;
    }
  }
  return { projects, experiments, notes };
}
