import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import type { RootState } from '@/sharedModules/state/store';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export type AuthState = {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  error: string | null;
  hasInitialized: boolean;
};

const initialState: AuthState = {
  session: null,
  user: null,
  status: 'idle',
  error: null,
  hasInitialized: false,
};

type AuthStateChangedPayload = {
  event: AuthChangeEvent | 'INITIAL_SESSION';
  session: Session | null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSyncStarted(state) {
      if (!state.hasInitialized) {
        state.status = 'loading';
      }
    },
    authStateChanged(state, action: PayloadAction<AuthStateChangedPayload>) {
      const { event, session } = action.payload;
      state.hasInitialized = true;

      if (event === 'SIGNED_OUT') {
        state.session = null;
        state.user = null;
        state.status = 'unauthenticated';
        state.error = null;
        return;
      }

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        state.session = session;
        state.user = (session?.user ?? null) as User | null;
        state.status = session ? 'authenticated' : 'unauthenticated';
        state.error = null;
        return;
      }

      if (session) {
        state.session = session;
        state.user = (session.user ?? null) as User | null;
      } else {
        state.session = null;
        state.user = null;
      }
    },

    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
      state.user = (action.payload?.user ?? null) as User | null;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
      state.error = null;
      state.hasInitialized = true;
    },

    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.status = action.payload ? 'error' : state.status;
      if (action.payload) {
        state.hasInitialized = true;
      }
    },
  },
});

export const { authSyncStarted, authStateChanged, setSession, setAuthError } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectSession = (state: RootState) => state.auth.session;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectHasInitializedAuth = (state: RootState) => state.auth.hasInitialized;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === 'authenticated' && Boolean(state.auth.session);
