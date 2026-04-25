import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { FREE_PLAN_LIMITS, type SubscriptionPlan } from '@/monetization/constants';
import {
  cancelStripeSubscription,
  type CheckoutBillingCycle,
  fetchSubscriptionStatusForUser,
  openStripeCheckout,
} from '@/monetization/services/subscriptionSupabaseService';
import { withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';
import type { RootState } from '@/store/store';

type MonetizationState = {
  plan: SubscriptionPlan;
  isPro: boolean;
  isLoading: boolean;
  isCheckoutLoading: boolean;
  isCancelLoading: boolean;
  error: string | null;
};

const initialState: MonetizationState = {
  plan: 'free',
  isPro: false,
  isLoading: false,
  isCheckoutLoading: false,
  isCancelLoading: false,
  error: null,
};

export const fetchSubscriptionStatusThunk = createAsyncThunk<
  { plan: SubscriptionPlan; isPro: boolean },
  void,
  { state: RootState }
>('monetization/fetchSubscriptionStatusThunk', async (_, { getState }) => {
  const userId = getState().auth.user?.id;
  if (!userId) return { plan: 'free', isPro: false };
  return withSupabaseClient((client) => fetchSubscriptionStatusForUser(client, userId), {
    returnOnUnavailable: { plan: 'free', isPro: false },
  });
});

export const openCheckoutThunk = createAsyncThunk<void, CheckoutBillingCycle | undefined, { state: RootState }>(
  'monetization/openCheckoutThunk',
  async (billingCycle) => {
    await withSupabaseClient((client) => openStripeCheckout(client, billingCycle));
  },
);

export const cancelSubscriptionThunk = createAsyncThunk<void, void, { state: RootState }>(
  'monetization/cancelSubscriptionThunk',
  async () => {
    await withSupabaseClient((client) => cancelStripeSubscription(client));
  },
);

const monetizationSlice = createSlice({
  name: 'monetization',
  initialState,
  reducers: {
    clearMonetizationState(state) {
      state.plan = 'free';
      state.isPro = false;
      state.isLoading = false;
      state.isCheckoutLoading = false;
      state.isCancelLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStatusThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatusThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plan = action.payload.plan;
        state.isPro = action.payload.isPro;
      })
      .addCase(fetchSubscriptionStatusThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch subscription';
      })
      .addCase(openCheckoutThunk.pending, (state) => {
        state.isCheckoutLoading = true;
        state.error = null;
      })
      .addCase(openCheckoutThunk.fulfilled, (state) => {
        state.isCheckoutLoading = false;
      })
      .addCase(openCheckoutThunk.rejected, (state, action) => {
        state.isCheckoutLoading = false;
        state.error = action.error.message ?? 'Checkout could not be started';
      })
      .addCase(cancelSubscriptionThunk.pending, (state) => {
        state.isCancelLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscriptionThunk.fulfilled, (state) => {
        state.isCancelLoading = false;
      })
      .addCase(cancelSubscriptionThunk.rejected, (state, action) => {
        state.isCancelLoading = false;
        state.error = action.error.message ?? 'Subscription cancellation could not be started';
      });
  },
});

export const { clearMonetizationState } = monetizationSlice.actions;
export default monetizationSlice.reducer;

export const selectIsProPlan = (state: RootState) => state.monetization.isPro;
export const selectSubscriptionPlan = (state: RootState) => state.monetization.plan;
export const selectIsCheckoutLoading = (state: RootState) => state.monetization.isCheckoutLoading;
export const selectIsCancelLoading = (state: RootState) => state.monetization.isCancelLoading;
export const selectCanUsePdfExport = (state: RootState) => state.monetization.isPro;
export const selectCanUseCsvCharts = (state: RootState) => state.monetization.isPro;
export const selectCanCreateProject = (state: RootState) =>
  state.monetization.isPro || state.project.projects.length < FREE_PLAN_LIMITS.projects;
export const selectCanCreateExperiment = (state: RootState) =>
  state.monetization.isPro || state.experiment.experiments.length < FREE_PLAN_LIMITS.experiments;
export const selectCanCreateHardware = (state: RootState) =>
  state.monetization.isPro || state.hardware.hardware.length < FREE_PLAN_LIMITS.hardware;
export const selectCanUseStorage = (state: RootState) =>
  state.monetization.isPro || (state.auth.user?.storageUsedMb ?? 0) < FREE_PLAN_LIMITS.storageMb;
