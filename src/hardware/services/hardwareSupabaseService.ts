import type { SupabaseClient } from '@supabase/supabase-js';

import type { HardwareItem } from '@/hardware/state/hardwareSlice';
import type { Database } from '@/sharedModules/services/supabase/database.types';
import { unwrapSupabaseClient } from '@/sharedModules/services/supabase/supabaseUntypedClient';

function mapRowToHardware(row: Database['public']['Tables']['hardware_library']['Row']): HardwareItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    specs: row.specifications ?? '',
    datasheetUrl: row.datasheet_url ?? '',
    updatedAt: row.updated_at,
  };
}

export async function fetchHardwareForUser(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<HardwareItem[]> {
  const sb = unwrapSupabaseClient(client);
  const { data, error } = await sb
    .from('hardware_library')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRowToHardware);
}

type CreateHardwareInput = Pick<HardwareItem, 'name' | 'category'> &
  Partial<Pick<HardwareItem, 'specs' | 'datasheetUrl'>>;

export async function insertHardwareForUser(
  client: SupabaseClient<Database>,
  userId: string,
  input: CreateHardwareInput,
): Promise<HardwareItem> {
  const sb = unwrapSupabaseClient(client);
  const insert: Database['public']['Tables']['hardware_library']['Insert'] = {
    owner_id: userId,
    name: input.name,
    category: input.category,
    specifications: input.specs ?? '',
    datasheet_url: input.datasheetUrl?.trim() ? input.datasheetUrl : null,
  };

  const { data, error } = await sb.from('hardware_library').insert(insert).select('*').single();
  if (error) throw error;
  return mapRowToHardware(data);
}

export async function updateHardwareForUser(
  client: SupabaseClient<Database>,
  hardware: HardwareItem,
): Promise<HardwareItem> {
  const sb = unwrapSupabaseClient(client);
  const { data, error } = await sb
    .from('hardware_library')
    .update({
      name: hardware.name,
      category: hardware.category,
      specifications: hardware.specs,
      datasheet_url: hardware.datasheetUrl?.trim() ? hardware.datasheetUrl : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', hardware.id)
    .select('*')
    .single();

  if (error) throw error;
  return mapRowToHardware(data);
}

export async function deleteHardwareForUser(
  client: SupabaseClient<Database>,
  hardwareId: string,
): Promise<void> {
  const sb = unwrapSupabaseClient(client);
  const { error } = await sb.from('hardware_library').delete().eq('id', hardwareId);
  if (error) throw error;
}
