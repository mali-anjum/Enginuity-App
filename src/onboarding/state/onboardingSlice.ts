import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Discipline =
  | 'electronics'
  | 'robotics'
  | 'cs'
  | 'physics'
  | 'other';

export type OnboardingState = {
  hasCompletedOnboarding: boolean;
  selectedDiscipline: Discipline | null;
};

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  selectedDiscipline: null,
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
    },
    completeOnboarding(state) {
      state.hasCompletedOnboarding = true;
    },
    resetOnboarding(state) {
      state.hasCompletedOnboarding = false;
      state.selectedDiscipline = null;
    },
  },
});

export const { setOnboardingCompleted, setSelectedDiscipline, completeOnboarding, resetOnboarding } =
  onboardingSlice.actions;

export default onboardingSlice.reducer;
