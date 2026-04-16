import type { RootState } from '@/shared/state/store';

export const selectOnboardingState = (state: RootState) => state.onboarding;
export const selectHasCompletedOnboarding = (state: RootState) =>
  state.onboarding.hasCompletedOnboarding;
export const selectSelectedDiscipline = (state: RootState) => state.onboarding.selectedDiscipline;
