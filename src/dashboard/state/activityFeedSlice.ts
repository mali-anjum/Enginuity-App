import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  fetchActivityLogsForUser,
  type ActivityLogItem,
} from '@/dashboard/services/activitySupabaseService';
import type { RootState } from '@/store/store';
import { withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';

type ActivityFeedState = {
  items: ActivityLogItem[];
  isLoading: boolean;
  error: string | null;
};

const initialState: ActivityFeedState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchActivityFeedThunk = createAsyncThunk<ActivityLogItem[], void, { state: RootState }>(
  'dashboard/fetchActivityFeedThunk',
  async (_, { getState }) => {
    const userId = getState().auth.user?.id;
    if (!userId) return [];
    return withSupabaseClient((client) => fetchActivityLogsForUser(client, userId), {
      returnOnUnavailable: [],
    });
  },
);

const activityFeedSlice = createSlice({
  name: 'activityFeed',
  initialState,
  reducers: {
    clearActivityFeedData(state) {
      state.items = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityFeedThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityFeedThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchActivityFeedThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to load activity feed';
      });
  },
});

export const { clearActivityFeedData } = activityFeedSlice.actions;
export default activityFeedSlice.reducer;

export const selectActivityFeedItems = (state: RootState) => state.activityFeed.items;
export const selectActivityFeedLoading = (state: RootState) => state.activityFeed.isLoading;
