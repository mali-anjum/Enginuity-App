import type { RootState } from '@/sharedModules/state/store';

export const selectOnboardingState = (state: RootState) => state.onboarding;
export const selectHasCompletedOnboarding = (state: RootState) =>
  state.onboarding.hasCompletedOnboarding;
export const selectSelectedDiscipline = (state: RootState) => state.onboarding.selectedDiscipline;
export const selectSelectedDisciplines = (state: RootState) => state.onboarding.selectedDisciplines;
