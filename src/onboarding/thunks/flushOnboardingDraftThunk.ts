import { createAsyncThunk } from '@reduxjs/toolkit';

import type { AuthDiscipline } from '@/auth/state/authSlice';
import { fetchProfileThunk } from '@/auth/state/authSlice';
import type { RootState } from '@/store/store';
import { getSupabaseClientOrNull } from '@/sharedModules/services/supabase/supabaseClient';

import {
  completeOnboarding,
  clearPreAuthGate,
  setOnboardingCompleted,
} from '@/onboarding/state/onboardingSlice';
import {
  mapFocusAreasToAuthDiscipline,
  type OnboardingProfileDraft,
} from '@/onboarding/types/profileDraft';

type PreferencesPayload = Record<string, unknown>;

function buildPreferencesPatch(draft: OnboardingProfileDraft): PreferencesPayload {
  return {
    onboarding_v1: {
      institutionType: draft.institutionType,
      usageTimePreference: draft.usageTimePreference,
      usageLocation: draft.usageLocation,
      weeklyHoursBand: draft.weeklyHoursBand,
      primaryGoal: draft.primaryGoal.trim(),
      discoverySource: draft.discoverySource.trim(),
      capturedAt: new Date().toISOString(),
    },
  };
}

export const flushOnboardingDraftThunk = createAsyncThunk<
  void,
  void,
  { state: RootState; rejectValue: string }
>('onboarding/flushDraft', async (_, { getState, dispatch, rejectWithValue }) => {
  const client = getSupabaseClientOrNull();
  if (!client) {
    return rejectWithValue('Supabase is not ready.');
  }

  const state = getState();
  const userId = state.auth.user?.id;
  if (!userId) {
    return rejectWithValue('Not signed in.');
  }

  const { data: existingProfile, error: profileReadErr } = await client
    .from('profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileReadErr) {
    return rejectWithValue(profileReadErr.message);
  }

  if (existingProfile && (existingProfile as { onboarding_completed?: boolean }).onboarding_completed) {
    dispatch(setOnboardingCompleted(true));
    dispatch(completeOnboarding());
    dispatch(clearPreAuthGate());
    await dispatch(fetchProfileThunk());
    return;
  }

  const draft = state.onboarding.profileDraft;
  const hasRichDraft =
    state.onboarding.hasCompletedPreAuthProfile ||
    draft.focusAreas.length > 0 ||
    draft.institutionName.trim().length > 0 ||
    draft.primaryGoal.trim().length > 0;

  const discipline: AuthDiscipline =
    draft.focusAreas.length > 0
      ? mapFocusAreasToAuthDiscipline(draft.focusAreas)
      : 'other';

  const fieldOfStudy =
    draft.focusAreas.length > 0
      ? `${draft.fieldOfStudy.trim() ? `${draft.fieldOfStudy.trim()} · ` : ''}${draft.focusAreas.join(', ')}`
      : draft.fieldOfStudy.trim() || null;

  try {
    const { data: existing, error: readError } = await client
      .from('profiles')
      .select('preferences,bio')
      .eq('user_id', userId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    const existingRow = existing as { preferences?: unknown } | null;
    const prevPrefs =
      existingRow &&
      typeof existingRow.preferences === 'object' &&
      existingRow.preferences !== null
        ? (existingRow.preferences as Record<string, unknown>)
        : {};

    const mergedPrefs: Record<string, unknown> = hasRichDraft
      ? {
          ...prevPrefs,
          ...buildPreferencesPatch(draft),
        }
      : prevPrefs;

    const bioSummary = hasRichDraft
      ? [
          draft.primaryGoal.trim() ? `Goal: ${draft.primaryGoal.trim()}` : null,
          draft.usageTimePreference && draft.usageLocation
            ? `Typical use: ${draft.usageTimePreference}, ${draft.usageLocation.replace('_', ' ')}`
            : null,
        ]
          .filter(Boolean)
          .join('\n')
      : null;

    const profileUpdate: Record<string, unknown> = {
      onboarding_completed: true,
    };

    if (hasRichDraft) {
      profileUpdate.preferences = mergedPrefs as never;
      profileUpdate.discipline = discipline;
      profileUpdate.institution = draft.institutionName.trim() || null;
      profileUpdate.field_of_study = fieldOfStudy;
      if (bioSummary) {
        profileUpdate.bio = bioSummary;
      }
    }

    const { error: profileError } = await client
      .from('profiles')
      .update(profileUpdate as never)
      .eq('user_id', userId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: userUpdateError } = await client
      .from('users')
      .update({ is_new_user: false } as never)
      .eq('id', userId);

    if (userUpdateError) {
      throw new Error(userUpdateError.message);
    }

    dispatch(setOnboardingCompleted(true));
    dispatch(completeOnboarding());
    dispatch(clearPreAuthGate());
    await dispatch(fetchProfileThunk());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save your profile.';
    return rejectWithValue(message);
  }
});
