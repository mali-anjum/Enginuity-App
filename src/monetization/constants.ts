export const FREE_PLAN_LIMITS = {
  projects: 3,
  experiments: 20,
  hardware: 5,
  storageMb: 100,
} as const;

export type SubscriptionPlan = 'free' | 'pro_monthly' | 'pro_yearly';
