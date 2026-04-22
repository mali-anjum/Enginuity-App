import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/sharedModules/state/store';

export type ThemeMode = 'light' | 'dark' | 'system';
export type RetryDescriptor = {
  typePrefix: string;
  arg: unknown;
  attempt: number;
  maxAttempts: number;
};

export type Toast = {
  id: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  retry?: RetryDescriptor;
};

type UiState = {
  theme: ThemeMode;
  toasts: Toast[];
  activeModal: string | null;
  isSearchOpen: boolean;
  bottomSheetContent: string | null;
};

const initialState: UiState = {
  theme: 'system',
  toasts: [],
  activeModal: null,
  isSearchOpen: false,
  bottomSheetContent: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    addToast(state, action: PayloadAction<Omit<Toast, 'id'> & { id?: string }>) {
      state.toasts.push({
        id: action.payload.id ?? `toast-${Date.now()}`,
        message: action.payload.message,
        variant: action.payload.variant ?? 'info',
      });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    toggleSearch(state) {
      state.isSearchOpen = !state.isSearchOpen;
    },
    setBottomSheetContent(state, action: PayloadAction<string | null>) {
      state.bottomSheetContent = action.payload;
    },
  },
});

export const { setTheme, addToast, removeToast, openModal, closeModal, toggleSearch, setBottomSheetContent } =
  uiSlice.actions;
export default uiSlice.reducer;

export const selectTheme = (state: RootState) => state.ui.theme;
export const selectToasts = (state: RootState) => state.ui.toasts;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;
export const selectIsSearchOpen = (state: RootState) => state.ui.isSearchOpen;
export const selectBottomSheetContent = (state: RootState) => state.ui.bottomSheetContent;
