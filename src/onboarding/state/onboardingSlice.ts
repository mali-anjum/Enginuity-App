import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Discipline =
  | 'mechanical'
  | 'electrical'
  | 'civil'
  | 'software'
  | 'chemical'
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

export const { setSelectedDiscipline, completeOnboarding, resetOnboarding } = onboardingSlice.actions;

export default onboardingSlice.reducer;
