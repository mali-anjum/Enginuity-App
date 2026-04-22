import type { SupabaseClient } from '@supabase/supabase-js';

import { unwrapSupabaseClient } from '@/sharedModules/services/supabase/supabaseUntypedClient';

export type ActivityEventType =
  | 'experiment_created'
  | 'experiment_status_changed'
  | 'note_added'
  | 'hardware_added'
  | 'unknown';

export type ActivityLogItem = {
  id: string;
  entityType: 'experiment' | 'note' | 'hardware' | 'project' | 'unknown';
  entityId: string | null;
  eventType: ActivityEventType;
  description: string;
  createdAt: string;
};

type ActivityRow = {
  id?: string;
  entity_id?: string | null;
  entity_type?: string | null;
  event_type?: string | null;
  action?: string | null;
  description?: string | null;
  message?: string | null;
  created_at?: string | null;
};

function toEventType(value: string | null | undefined): ActivityEventType {
  switch ((value ?? '').toLowerCase()) {
    case 'experiment_created':
    case 'create_experiment':
      return 'experiment_created';
    case 'experiment_status_changed':
    case 'update_experiment_status':
      return 'experiment_status_changed';
    case 'note_added':
    case 'create_note':
      return 'note_added';
    case 'hardware_added':
    case 'create_hardware':
      return 'hardware_added';
    default:
      return 'unknown';
  }
}

function toEntityType(value: string | null | undefined): ActivityLogItem['entityType'] {
  switch ((value ?? '').toLowerCase()) {
    case 'experiment':
    case 'experiments':
      return 'experiment';
    case 'note':
    case 'notes':
      return 'note';
    case 'hardware':
    case 'hardware_component':
    case 'hardware_library':
      return 'hardware';
    case 'project':
    case 'projects':
      return 'project';
    default:
      return 'unknown';
  }
}

export async function fetchActivityLogsForUser(
  client: SupabaseClient,
  userId: string,
  limit = 30,
): Promise<ActivityLogItem[]> {
  const unsafeClient = unwrapSupabaseClient(client);
  const { data, error } = await unsafeClient
    .from('activity_logs')
    .select('id, entity_id, entity_type, event_type, action, description, message, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ActivityRow[];
  return rows.map((row) => {
    const inferredEntity = toEntityType(row.entity_type);
    const inferredEvent = toEventType(row.event_type ?? row.action);
    const description =
      row.description?.trim() ||
      row.message?.trim() ||
      (inferredEvent === 'experiment_created'
        ? 'Experiment created'
        : inferredEvent === 'experiment_status_changed'
          ? 'Experiment status changed'
          : inferredEvent === 'note_added'
            ? 'Note added'
            : inferredEvent === 'hardware_added'
              ? 'Hardware component added'
              : 'Activity recorded');

    return {
      id: row.id ?? `${row.created_at ?? Date.now()}-${Math.random().toString(16).slice(2)}`,
      entityType: inferredEntity,
      entityId: row.entity_id ?? null,
      eventType: inferredEvent,
      description,
      createdAt: row.created_at ?? new Date().toISOString(),
    };
  });
}
