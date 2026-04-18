import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  INITIAL_ONBOARDING_PROFILE_DRAFT,
  type FocusArea,
  type InstitutionType,
  type OnboardingProfileDraft,
  type UsageLocation,
  type UsageTimePreference,
  type WeeklyHoursBand,
} from '@/onboarding/types/profileDraft';

export type Discipline = FocusArea;

export type OnboardingState = {
  /** Server-aligned flag: user finished onboarding (profile persisted). */
  hasCompletedOnboarding: boolean;
  /** User finished the pre-auth questionnaire and tapped through to sign up. */
  hasCompletedPreAuthProfile: boolean;
  selectedDiscipline: Discipline | null;
  selectedDisciplines: Discipline[];
  profileDraft: OnboardingProfileDraft;
};

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  hasCompletedPreAuthProfile: false,
  selectedDiscipline: null,
  selectedDisciplines: [],
  profileDraft: INITIAL_ONBOARDING_PROFILE_DRAFT,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingCompleted(state, action: PayloadAction<boolean>) {
      state.hasCompletedOnboarding = action.payload;
    },
    setSelectedDiscipline(state, action: PayloadAction<Discipline>) {
      state.selectedDiscipline = action.payload;
      state.selectedDisciplines = [action.payload];
      state.profileDraft.focusAreas = [action.payload];
    },
    setSelectedDisciplines(state, action: PayloadAction<Discipline[]>) {
      state.selectedDisciplines = action.payload;
      state.selectedDiscipline = action.payload[0] ?? null;
      state.profileDraft.focusAreas = action.payload;
    },
    toggleSelectedDiscipline(state, action: PayloadAction<Discipline>) {
      if (state.selectedDisciplines.includes(action.payload)) {
        state.selectedDisciplines = state.selectedDisciplines.filter(
          (discipline) => discipline !== action.payload,
        );
      } else {
        state.selectedDisciplines.push(action.payload);
      }
      state.selectedDiscipline = state.selectedDisciplines[0] ?? null;
      state.profileDraft.focusAreas = state.selectedDisciplines;
    },
    completeOnboarding(state) {
      state.hasCompletedOnboarding = true;
    },
    /** Call when user completes review and continues to sign up. */
    markPreAuthProfileCompleted(state) {
      state.hasCompletedPreAuthProfile = true;
    },
    clearPreAuthGate(state) {
      state.hasCompletedPreAuthProfile = false;
      state.profileDraft = INITIAL_ONBOARDING_PROFILE_DRAFT;
      state.selectedDiscipline = null;
      state.selectedDisciplines = [];
    },
    updateProfileDraft(state, action: PayloadAction<Partial<OnboardingProfileDraft>>) {
      state.profileDraft = { ...state.profileDraft, ...action.payload };
      if (action.payload.focusAreas) {
        state.selectedDisciplines = action.payload.focusAreas;
        state.selectedDiscipline = action.payload.focusAreas[0] ?? null;
      }
    },
    setFocusAreas(state, action: PayloadAction<FocusArea[]>) {
      state.profileDraft.focusAreas = action.payload;
      state.selectedDisciplines = action.payload;
      state.selectedDiscipline = action.payload[0] ?? null;
    },
    setInstitutionFields(
      state,
      action: PayloadAction<{
        institutionName: string;
        institutionType: InstitutionType | null;
        fieldOfStudy: string;
      }>,
    ) {
      state.profileDraft.institutionName = action.payload.institutionName;
      state.profileDraft.institutionType = action.payload.institutionType;
      state.profileDraft.fieldOfStudy = action.payload.fieldOfStudy;
    },
    setUsageFields(
      state,
      action: PayloadAction<{
        usageTimePreference: UsageTimePreference | null;
        usageLocation: UsageLocation | null;
        weeklyHoursBand: WeeklyHoursBand | null;
      }>,
    ) {
      state.profileDraft.usageTimePreference = action.payload.usageTimePreference;
      state.profileDraft.usageLocation = action.payload.usageLocation;
      state.profileDraft.weeklyHoursBand = action.payload.weeklyHoursBand;
    },
    setGoalsFields(
      state,
      action: PayloadAction<{ primaryGoal: string; discoverySource: string }>,
    ) {
      state.profileDraft.primaryGoal = action.payload.primaryGoal;
      state.profileDraft.discoverySource = action.payload.discoverySource;
    },
    resetOnboarding(state) {
      state.hasCompletedOnboarding = false;
      state.hasCompletedPreAuthProfile = false;
      state.selectedDiscipline = null;
      state.selectedDisciplines = [];
      state.profileDraft = INITIAL_ONBOARDING_PROFILE_DRAFT;
    },
  },
});

export const {
  setOnboardingCompleted,
  setSelectedDiscipline,
  setSelectedDisciplines,
  toggleSelectedDiscipline,
  completeOnboarding,
  markPreAuthProfileCompleted,
  clearPreAuthGate,
  updateProfileDraft,
  setFocusAreas,
  setInstitutionFields,
  setUsageFields,
  setGoalsFields,
  resetOnboarding,
} = onboardingSlice.actions;

export type { OnboardingProfileDraft };

export default onboardingSlice.reducer;
