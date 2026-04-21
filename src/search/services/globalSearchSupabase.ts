import type { Database } from '@/sharedModules/services/supabase/database.types';
import { withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';

export type GlobalSearchEntityRow = {
  entity_type: string;
  entity_id: string;
  title: string;
  project_id: string | null;
  project_title: string | null;
  snippet: string | null;
  rank: number;
};

export async function fetchGlobalSearchEntities(params: {
  searchQuery: string;
  filterProjectId?: string;
  filterStatus?: string;
  filterHardwareId?: string;
  filterTags?: string[];
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
      const rpcArgs: Database['public']['Functions']['global_search_entities']['Args'] = {
        search_query: q,
        filter_project_id: params.filterProjectId ?? null,
        filter_status: params.filterStatus ?? null,
        filter_hardware_id: params.filterHardwareId ?? null,
        filter_tags: params.filterTags?.length ? params.filterTags : null,
        date_from: params.dateFrom ?? null,
        date_to: params.dateTo ?? null,
        result_limit: params.resultLimit ?? null,
      };
      // Hand-written Database tables omit Relationships[] required for full postgrest-js rpc inference.
      // @ts-expect-error Supabase rpc resolves Args to never until types are regenerated from the CLI
      const { data, error } = await client.rpc('global_search_entities', rpcArgs);
      if (error) {
        return [];
      }
      return (data ?? []) as GlobalSearchEntityRow[];
    },
    { returnOnUnavailable: [] },
  );
}

export function aggregateGlobalSearchCounts(rows: GlobalSearchEntityRow[]) {
  let experiments = 0;
  let notes = 0;
  let hardware = 0;
  for (const row of rows) {
    if (row.entity_type === 'experiment') {
      experiments += 1;
    } else if (row.entity_type === 'note') {
      notes += 1;
    } else if (row.entity_type === 'hardware') {
      hardware += 1;
    }
  }
  return { experiments, notes, hardware };
}
