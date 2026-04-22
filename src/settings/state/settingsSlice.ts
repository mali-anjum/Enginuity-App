import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchProfileThunk } from '@/auth/state/authSlice';
import type { RootState } from '@/sharedModules/state/store';
import {
  fetchProfileStorageUsedMb,
  fetchUserNotificationSettings,
  type NotificationPrefs,
  saveUserNotificationSettings,
} from '@/settings/services/userSettingsSupabaseService';
import {
  enqueueLocalSyncQueueItem,
  processPendingLocalSyncQueue,
} from '@/settings/services/localSyncQueueService';

export type SettingsState = {
  notificationPrefs: NotificationPrefs;
  storageUsedMb: number | null;
  notificationsLoaded: boolean;
  storageLoaded: boolean;
  isSavingNotifications: boolean;
  isLoadingNotifications: boolean;
  isLoadingStorage: boolean;
  isSyncing: boolean;
  syncProgress: {
    processed: number;
    total: number;
    remaining: number;
  };
  error: string | null;
};

const defaultPrefs: NotificationPrefs = {
  pushNotificationsEnabled: true,
  emailNotificationsEnabled: true,
  experimentRemindersEnabled: true,
};

const initialState: SettingsState = {
  notificationPrefs: defaultPrefs,
  storageUsedMb: null,
  notificationsLoaded: false,
  storageLoaded: false,
  isSavingNotifications: false,
  isLoadingNotifications: false,
  isLoadingStorage: false,
  isSyncing: false,
  syncProgress: { processed: 0, total: 0, remaining: 0 },
  error: null,
};

export const fetchNotificationSettingsThunk = createAsyncThunk<
  NotificationPrefs,
  void,
  { state: RootState; rejectValue: string }
>('settings/fetchNotificationSettings', async (_, { getState, rejectWithValue }) => {
  const userId = getState().auth.user?.id;
  if (!userId) {
    return rejectWithValue('Not signed in');
  }
  try {
    return await fetchUserNotificationSettings(userId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load settings');
  }
});

export const saveNotificationSettingsThunk = createAsyncThunk<
  NotificationPrefs,
  NotificationPrefs,
  { state: RootState; rejectValue: string }
>('settings/saveNotificationSettings', async (prefs, { getState, rejectWithValue }) => {
  const userId = getState().auth.user?.id;
  if (!userId) {
    return rejectWithValue('Not signed in');
  }
  try {
    await saveUserNotificationSettings(userId, prefs);
    return prefs;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to save settings');
  }
});

export const fetchStorageUsageThunk = createAsyncThunk<number, void, { state: RootState; rejectValue: string }>(
  'settings/fetchStorageUsage',
  async (_, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id;
    if (!userId) {
      return rejectWithValue('Not signed in');
    }
    try {
      return await fetchProfileStorageUsedMb(userId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load storage');
    }
  },
);

export const manualSyncThunk = createAsyncThunk<void, void, { state: RootState; rejectValue: string }>(
  'settings/manualSync',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id;
    if (!userId) {
      return rejectWithValue('Not signed in');
    }
    try {
      await enqueueLocalSyncQueueItem({
        userId,
        entityType: 'manual_sync',
        entityId: `manual-sync-${Date.now()}`,
        operation: 'update',
        payload: { source: 'settings_ui', created_at: new Date().toISOString() },
      });
      await dispatch(processLocalSyncQueueThunk());
      await dispatch(fetchProfileThunk());
      await dispatch(fetchStorageUsageThunk());
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sync failed');
    }
  },
);

export const processLocalSyncQueueThunk = createAsyncThunk<
  { processed: number; total: number; remaining: number },
  void,
  { state: RootState; rejectValue: string }
>('settings/processLocalSyncQueue', async (_, { getState, rejectWithValue }) => {
  const userId = getState().auth.user?.id;
  if (!userId) {
    return rejectWithValue('Not signed in');
  }
  try {
    return await processPendingLocalSyncQueue(userId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to process sync queue');
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationSettingsThunk.pending, (state) => {
        state.isLoadingNotifications = true;
        state.error = null;
      })
      .addCase(fetchNotificationSettingsThunk.fulfilled, (state, action) => {
        state.isLoadingNotifications = false;
        state.notificationsLoaded = true;
        state.notificationPrefs = action.payload;
      })
      .addCase(fetchNotificationSettingsThunk.rejected, (state, action) => {
        state.isLoadingNotifications = false;
        state.error = action.payload ?? 'Failed to load notification settings';
      })
      .addCase(saveNotificationSettingsThunk.pending, (state) => {
        state.isSavingNotifications = true;
        state.error = null;
      })
      .addCase(saveNotificationSettingsThunk.fulfilled, (state, action) => {
        state.isSavingNotifications = false;
        state.notificationPrefs = action.payload;
      })
      .addCase(saveNotificationSettingsThunk.rejected, (state, action) => {
        state.isSavingNotifications = false;
        state.error = action.payload ?? 'Failed to save notification settings';
      })
      .addCase(fetchStorageUsageThunk.pending, (state) => {
        state.isLoadingStorage = true;
        state.error = null;
      })
      .addCase(fetchStorageUsageThunk.fulfilled, (state, action) => {
        state.isLoadingStorage = false;
        state.storageLoaded = true;
        state.storageUsedMb = action.payload;
      })
      .addCase(fetchStorageUsageThunk.rejected, (state, action) => {
        state.isLoadingStorage = false;
        state.error = action.payload ?? 'Failed to load storage usage';
      })
      .addCase(manualSyncThunk.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(manualSyncThunk.fulfilled, (state) => {
        state.isSyncing = false;
      })
      .addCase(manualSyncThunk.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload ?? 'Manual sync failed';
      })
      .addCase(processLocalSyncQueueThunk.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(processLocalSyncQueueThunk.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.syncProgress = action.payload;
      })
      .addCase(processLocalSyncQueueThunk.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload ?? 'Sync queue processing failed';
      });
  },
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;

export const selectNotificationPrefs = (state: RootState) => state.settings.notificationPrefs;
export const selectStorageUsedMb = (state: RootState) => state.settings.storageUsedMb;
export const selectSettingsError = (state: RootState) => state.settings.error;
export const selectIsSyncing = (state: RootState) => state.settings.isSyncing;
export const selectSyncProgress = (state: RootState) => state.settings.syncProgress;
