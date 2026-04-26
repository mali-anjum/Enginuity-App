import * as WebBrowser from 'expo-web-browser';
import type { SupabaseClient } from '@supabase/supabase-js';

import { unwrapSupabaseClient } from '@/sharedModules/services/supabase/supabaseUntypedClient';
import type { SubscriptionPlan } from '@/monetization/constants';

type SubscriptionRow = {
  plan?: string | null;
  status?: string | null;
};

export type SubscriptionStatusResult = {
  plan: SubscriptionPlan;
  isPro: boolean;
};

export type CheckoutBillingCycle = 'monthly' | 'annual';

function normalizePlan(value: string | null | undefined): SubscriptionPlan {
  const plan = (value ?? '').toLowerCase();
  if (plan.includes('year')) return 'pro_yearly';
  if (plan.includes('pro') || plan.includes('month')) return 'pro_monthly';
  return 'free';
}

function isActiveStatus(value: string | null | undefined): boolean {
  const status = (value ?? '').toLowerCase();
  return status === 'active' || status === 'trialing' || status === 'paid';
}

export async function fetchSubscriptionStatusForUser(
  client: SupabaseClient,
  userId: string,
): Promise<SubscriptionStatusResult> {
  const sb = unwrapSupabaseClient(client);
  const { data, error } = await sb
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = (data ?? null) as SubscriptionRow | null;
  if (!row) return { plan: 'free', isPro: false };
  const plan = normalizePlan(row.plan);
  const active = isActiveStatus(row.status);
  return { plan, isPro: active && plan !== 'free' };
}

export async function openStripeCheckout(
  client: SupabaseClient,
  billingCycle: CheckoutBillingCycle = 'monthly',
): Promise<void> {
  const sb = unwrapSupabaseClient(client);
  const { data, error } = await sb.functions.invoke('create-stripe-checkout', {
    body: { source: 'enginuity-paywall', billingCycle },
  });

  if (error) {
    throw new Error(error.message);
  }

  const checkoutUrl = (data as { url?: string } | null)?.url;
  if (!checkoutUrl) {
    throw new Error('Checkout URL was not returned');
  }

  await WebBrowser.openBrowserAsync(checkoutUrl);
}

export async function cancelStripeSubscription(client: SupabaseClient): Promise<void> {
  const sb = unwrapSupabaseClient(client);
  const { error } = await sb.functions.invoke('cancel-stripe-subscription', {
    body: { source: 'enginuity-account-settings' },
  });

  if (error) {
    throw new Error(error.message);
  }
}
