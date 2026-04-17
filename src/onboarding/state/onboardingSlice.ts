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
  selectedDisciplines: Discipline[];
};

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  selectedDiscipline: null,
  selectedDisciplines: [],
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
    },
    setSelectedDisciplines(state, action: PayloadAction<Discipline[]>) {
      state.selectedDisciplines = action.payload;
      state.selectedDiscipline = action.payload[0] ?? null;
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
    },
    completeOnboarding(state) {
      state.hasCompletedOnboarding = true;
    },
    resetOnboarding(state) {
      state.hasCompletedOnboarding = false;
      state.selectedDiscipline = null;
      state.selectedDisciplines = [];
    },
  },
});

export const {
  setOnboardingCompleted,
  setSelectedDiscipline,
  setSelectedDisciplines,
  toggleSelectedDiscipline,
  completeOnboarding,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
