import { withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';

export type NotificationPrefs = {
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  experimentRemindersEnabled: boolean;
};

function randomUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function fetchUserNotificationSettings(userId: string): Promise<NotificationPrefs> {
  const { data, error } = await withSupabaseClient((client) =>
    client
      .from('user_settings')
      .select(
        'push_notifications_enabled, email_notifications_enabled, experiment_reminders_enabled',
      )
      .eq('user_id', userId)
      .maybeSingle(),
  );

  if (error) {
    throw new Error(error.message);
  }

  const row = data as {
    push_notifications_enabled?: boolean;
    email_notifications_enabled?: boolean;
    experiment_reminders_enabled?: boolean;
  } | null;

  return {
    pushNotificationsEnabled: row?.push_notifications_enabled ?? true,
    emailNotificationsEnabled: row?.email_notifications_enabled ?? true,
    experimentRemindersEnabled: row?.experiment_reminders_enabled ?? true,
  };
}

export async function saveUserNotificationSettings(userId: string, prefs: NotificationPrefs) {
  const { error } = await withSupabaseClient((client) =>
    client.from('user_settings').upsert(
      {
        user_id: userId,
        push_notifications_enabled: prefs.pushNotificationsEnabled,
        email_notifications_enabled: prefs.emailNotificationsEnabled,
        experiment_reminders_enabled: prefs.experimentRemindersEnabled,
      },
      { onConflict: 'user_id' },
    ),
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchProfileStorageUsedMb(userId: string): Promise<number> {
  const { data, error } = await withSupabaseClient((client) =>
    client.from('profiles').select('storage_used_mb').eq('user_id', userId).maybeSingle(),
  );

  if (error) {
    throw new Error(error.message);
  }

  const row = data as { storage_used_mb?: number | string | null } | null;
  const raw = row?.storage_used_mb;
  if (raw === null || raw === undefined) {
    return 0;
  }
  const n = typeof raw === 'string' ? Number.parseFloat(raw) : raw;
  return Number.isFinite(n) ? n : 0;
}

export async function enqueueManualSyncJob(
  userId: string,
  input?: {
    entityType?: string;
    entityId?: string;
    operation?: 'insert' | 'update' | 'delete';
    payload?: Record<string, unknown>;
  },
) {
  const { error } = await withSupabaseClient((client) =>
    client.from('sync_queue').insert({
      user_id: userId,
      entity_type: input?.entityType ?? 'manual_sync',
      entity_id: input?.entityId ?? randomUuidV4(),
      operation: input?.operation ?? 'update',
      status: 'pending',
      payload: input?.payload ?? { source: 'settings_ui', created_at: new Date().toISOString() },
    }),
  );

  if (error) {
    throw new Error(error.message);
  }
}
