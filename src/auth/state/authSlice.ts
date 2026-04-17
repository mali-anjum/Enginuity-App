import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchProfileByUserId,
  saveProfileByUserId,
  uploadAvatarAndPersist,
} from '@/auth/services/profileSupabaseService';
import type { RootState } from '@/sharedModules/state/store';
import { oauthAuthService } from '@/auth/services/oauthAuthService';
import type { OAuthProviderKey } from '@/auth/services/oauthProviders';

export type AuthDiscipline = 'mechanical' | 'electrical' | 'civil' | 'software' | 'chemical' | 'other';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  discipline: AuthDiscipline | null;
  avatarUrl: string | null;
  bio: string;
};

export type AuthSession = {
  token: string;
  expiresAt: number | null;
};

export type AuthState = {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  hasInitialized: boolean;
};

const initialState: AuthState = {
  session: null,
  user: null,
  isLoading: false,
  error: null,
  hasInitialized: false,
};
type LoginPayload = { provider: OAuthProviderKey };
type SignupPayload = { email: string; password: string; name: string; discipline?: AuthDiscipline | null };
type SessionPayload = { token: string; expiresAt: number | null };
type ProfilePayload = Pick<AuthUser, 'name' | 'discipline' | 'bio'>;
type AvatarPayload = { localUri: string };
type PasswordLoginPayload = { email: string; password: string };
type ForgotPasswordPayload = { email: string };
type ResetPasswordPayload = { password: string; confirmPassword: string };

export const loginThunk = createAsyncThunk<AuthSession | null, LoginPayload, { rejectValue: string }>(
  'auth/loginThunk',
  async ({ provider }, { rejectWithValue }) => {
    try {
      await oauthAuthService.signInWithProvider(provider);
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  },
);

export const signupThunk = createAsyncThunk<void, SignupPayload, { rejectValue: string }>(
  'auth/signupThunk',
  async ({ email, password, name, discipline = null }, { rejectWithValue }) => {
    try {
      await oauthAuthService.signUpWithPassword({ email, password, name, discipline });
      return;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Signup failed');
    }
  },
);

export const loginWithPasswordThunk = createAsyncThunk<void, PasswordLoginPayload, { rejectValue: string }>(
  'auth/loginWithPasswordThunk',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await oauthAuthService.signInWithPassword(email, password);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Email login failed');
    }
  },
);

export const forgotPasswordThunk = createAsyncThunk<void, ForgotPasswordPayload, { rejectValue: string }>(
  'auth/forgotPasswordThunk',
  async ({ email }, { rejectWithValue }) => {
    try {
      await oauthAuthService.sendPasswordResetEmail(email);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Could not send password reset email',
      );
    }
  },
);

export const resetPasswordThunk = createAsyncThunk<void, ResetPasswordPayload, { rejectValue: string }>(
  'auth/resetPasswordThunk',
  async ({ password, confirmPassword }, { rejectWithValue }) => {
    if (password !== confirmPassword) {
      return rejectWithValue('Passwords do not match.');
    }
    if (password.length < 8) {
      return rejectWithValue('Password must be at least 8 characters.');
    }
    try {
      await oauthAuthService.updatePassword(password);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Could not reset password');
    }
  },
);

export const logoutThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutThunk',
  async (_, { rejectWithValue }) => {
    try {
      await oauthAuthService.signOut();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  },
);

export const refreshSessionThunk = createAsyncThunk<AuthSession, SessionPayload, { rejectValue: string }>(
  'auth/refreshSessionThunk',
  async ({ token, expiresAt }, { rejectWithValue }) => {
    try {
      return { token, expiresAt };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Session refresh failed');
    }
  },
);

export const updateProfileThunk = createAsyncThunk<AuthUser, ProfilePayload, { state: RootState; rejectValue: string }>(
  'auth/updateProfileThunk',
  async ({ name, discipline, bio }, { getState, rejectWithValue }) => {
    try {
      const currentUser = getState().auth.user;
      if (!currentUser) {
        return rejectWithValue('No authenticated user');
      }
      await saveProfileByUserId(currentUser.id, {
        name: name.trim(),
        discipline,
        bio: bio.trim(),
      });
      return { ...currentUser, name: name.trim(), discipline, bio: bio.trim() };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Profile update failed');
    }
  },
);

export const fetchProfileThunk = createAsyncThunk<AuthUser, void, { state: RootState; rejectValue: string }>(
  'auth/fetchProfileThunk',
  async (_, { getState, rejectWithValue }) => {
    try {
      const currentUser = getState().auth.user;
      if (!currentUser) {
        return rejectWithValue('No authenticated user');
      }
      const profile = await fetchProfileByUserId(currentUser.id, currentUser.name);
      return {
        ...currentUser,
        name: profile.name,
        discipline: profile.discipline,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Could not load profile');
    }
  },
);

export const uploadAvatarThunk = createAsyncThunk<AuthUser, AvatarPayload, { state: RootState; rejectValue: string }>(
  'auth/uploadAvatarThunk',
  async ({ localUri }, { getState, rejectWithValue }) => {
    try {
      const currentUser = getState().auth.user;
      if (!currentUser) {
        return rejectWithValue('No authenticated user');
      }
      const avatarUrl = await uploadAvatarAndPersist(currentUser.id, localUri);
      return { ...currentUser, avatarUrl };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Avatar upload failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSyncStarted(state) {
      state.isLoading = true;
    },
    authStateChanged(state, action: PayloadAction<{ user: AuthUser | null; session: AuthSession | null }>) {
      const { user, session } = action.payload;
      state.hasInitialized = true;
      state.user = user;
      state.session = session;
      state.isLoading = false;
      state.error = null;
    },
    setSession(state, action: PayloadAction<AuthSession | null>) {
      state.session = action.payload;
      state.isLoading = false;
      state.hasInitialized = true;
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.hasInitialized = true;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
      if (action.payload) {
        state.hasInitialized = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
      })
      .addCase(signupThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.hasInitialized = true;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Signup failed';
      })
      .addCase(loginWithPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(loginWithPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Email login failed';
      })
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Could not send password reset email';
      })
      .addCase(resetPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Could not reset password';
      })
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.session = null;
        state.hasInitialized = true;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Logout failed';
      })
      .addCase(refreshSessionThunk.fulfilled, (state, action) => {
        state.session = action.payload;
        state.hasInitialized = true;
      })
      .addCase(refreshSessionThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Session refresh failed';
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Profile update failed';
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Could not load profile';
      })
      .addCase(uploadAvatarThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(uploadAvatarThunk.rejected, (state, action) => {
        state.error = action.payload ?? 'Avatar upload failed';
      });
  },
});

export const { authSyncStarted, authStateChanged, setSession, setUser, setAuthError } = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (state: RootState) => state.auth.user;
export const selectIsLoggedIn = (state: RootState) => Boolean(state.auth.user && state.auth.session);
export const selectUserDiscipline = (state: RootState) => state.auth.user?.discipline ?? null;
export const selectSession = (state: RootState) => state.auth.session;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthStatus = (state: RootState) => (state.auth.isLoading ? 'loading' : 'idle');
export const selectHasInitializedAuth = (state: RootState) => state.auth.hasInitialized;
export const selectIsAuthenticated = selectIsLoggedIn;
