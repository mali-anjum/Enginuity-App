import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export type AuthState = {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  error: string | null;
};

const initialState: AuthState = {
  session: null,
  user: null,
  status: 'loading',
  error: null,
};

type AuthStateChangedPayload = {
  event: AuthChangeEvent | 'INITIAL_SESSION';
  session: Session | null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStateChanged(state, action: PayloadAction<AuthStateChangedPayload>) {
      const { event, session } = action.payload;

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
    },

    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.status = action.payload ? 'error' : state.status;
    },
  },
});

export const { authStateChanged, setSession, setAuthError } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectSession = (state: { auth: AuthState }) => state.auth.session;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
