import type { RootState } from '@/sharedModules/state/store';

export const selectOnboardingState = (state: RootState) => state.onboarding;
export const selectHasCompletedOnboarding = (state: RootState) =>
  state.onboarding.hasCompletedOnboarding;
export const selectSelectedDiscipline = (state: RootState) => state.onboarding.selectedDiscipline;
export const selectSelectedDisciplines = (state: RootState) => state.onboarding.selectedDisciplines;
export const selectHasCompletedPreAuthProfile = (state: RootState) =>
  state.onboarding.hasCompletedPreAuthProfile;
export const selectOnboardingProfileDraft = (state: RootState) => state.onboarding.profileDraft;
