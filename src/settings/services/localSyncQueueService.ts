import AsyncStorage from '@react-native-async-storage/async-storage';

import { enqueueManualSyncJob } from '@/settings/services/userSettingsSupabaseService';
import { createLocalUuidV4 } from '@/sharedModules/utils/uuid';

const LOCAL_SYNC_QUEUE_KEY = 'local_sync_queue_v1';

export type LocalSyncQueueItem = {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  operation: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  status: 'pending' | 'synced';
  createdAt: string;
  syncedAt: string | null;
};

async function readQueue(): Promise<LocalSyncQueueItem[]> {
  const raw = await AsyncStorage.getItem(LOCAL_SYNC_QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LocalSyncQueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: LocalSyncQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_SYNC_QUEUE_KEY, JSON.stringify(items));
}

export async function enqueueLocalSyncQueueItem(
  item: Omit<LocalSyncQueueItem, 'id' | 'status' | 'createdAt' | 'syncedAt'>,
): Promise<LocalSyncQueueItem> {
  const queue = await readQueue();
  const nextItem: LocalSyncQueueItem = {
    id: createLocalUuidV4(),
    userId: item.userId,
    entityType: item.entityType,
    entityId: item.entityId,
    operation: item.operation,
    payload: item.payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
    syncedAt: null,
  };
  queue.push(nextItem);
  await writeQueue(queue);
  return nextItem;
}

export async function processPendingLocalSyncQueue(
  userId: string,
): Promise<{ processed: number; total: number; remaining: number }> {
  const queue = await readQueue();
  const pendingIndexes = queue
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.userId === userId && item.status === 'pending')
    .sort((a, b) => a.item.createdAt.localeCompare(b.item.createdAt));

  let processed = 0;
  const total = pendingIndexes.length;

  for (const { item, index } of pendingIndexes) {
    try {
      await enqueueManualSyncJob(userId, {
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
        payload: item.payload,
      });
      queue[index] = {
        ...queue[index],
        status: 'synced',
        syncedAt: new Date().toISOString(),
      };
      processed += 1;
    } catch {
      // stop processing on first network/server error to preserve order
      break;
    }
  }

  await writeQueue(queue);
  const remaining = queue.filter((item) => item.userId === userId && item.status === 'pending').length;
  return { processed, total, remaining };
}
