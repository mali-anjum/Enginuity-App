import { deleteAccountThunk, fetchProfileThunk, forgotPasswordThunk, loginThunk, loginWithPasswordThunk, logoutThunk, refreshSessionThunk, resetPasswordThunk, signupThunk, updateProfileThunk, uploadAvatarThunk } from '@/auth/state/authSlice';
import { createExperimentThunk, deleteExperimentThunk, fetchExperimentsThunk, syncPendingExperimentsThunk, updateExperimentThunk, uploadAttachmentThunk } from '@/experiment/state/experimentSlice';
import { addHardwareThunk, deleteHardwareThunk, fetchHardwareThunk, updateHardwareThunk } from '@/hardware/state/hardwareSlice';
import { createCustomTagThunk, createNoteThunk, deleteNoteThunk, fetchNotesThunk, fetchTagCountsThunk, searchNotesThunk, toggleNoteFavoriteThunk, updateNoteThunk } from '@/notes/state/notesSlice';
import { flushOnboardingDraftThunk } from '@/onboarding/thunks/flushOnboardingDraftThunk';
import { createProjectThunk, deleteProjectThunk, fetchProjectsThunk, syncPendingProjectsThunk, toggleFavouriteThunk, toggleProjectStatusThunk, updateProjectThunk } from '@/project/state/projectSlice';
import { fetchNotificationSettingsThunk, fetchStorageUsageThunk, manualSyncThunk, processLocalSyncQueueThunk, saveNotificationSettingsThunk } from '@/settings/state/settingsSlice';
import type { AppDispatch } from '@/sharedModules/state/store';
import type { RetryDescriptor } from '@/ui/state/uiSlice';

type RetryThunkCreator = (arg: any) => any;

const RETRYABLE_THUNKS: Record<string, RetryThunkCreator> = {
  [loginThunk.typePrefix]: loginThunk,
  [signupThunk.typePrefix]: signupThunk,
  [loginWithPasswordThunk.typePrefix]: loginWithPasswordThunk,
  [forgotPasswordThunk.typePrefix]: forgotPasswordThunk,
  [resetPasswordThunk.typePrefix]: resetPasswordThunk,
  [logoutThunk.typePrefix]: logoutThunk,
  [deleteAccountThunk.typePrefix]: deleteAccountThunk,
  [refreshSessionThunk.typePrefix]: refreshSessionThunk,
  [updateProfileThunk.typePrefix]: updateProfileThunk,
  [fetchProfileThunk.typePrefix]: fetchProfileThunk,
  [uploadAvatarThunk.typePrefix]: uploadAvatarThunk,
  [fetchProjectsThunk.typePrefix]: fetchProjectsThunk,
  [createProjectThunk.typePrefix]: createProjectThunk,
  [syncPendingProjectsThunk.typePrefix]: syncPendingProjectsThunk,
  [updateProjectThunk.typePrefix]: updateProjectThunk,
  [deleteProjectThunk.typePrefix]: deleteProjectThunk,
  [toggleFavouriteThunk.typePrefix]: toggleFavouriteThunk,
  [toggleProjectStatusThunk.typePrefix]: toggleProjectStatusThunk,
  [fetchExperimentsThunk.typePrefix]: fetchExperimentsThunk,
  [createExperimentThunk.typePrefix]: createExperimentThunk,
  [syncPendingExperimentsThunk.typePrefix]: syncPendingExperimentsThunk,
  [updateExperimentThunk.typePrefix]: updateExperimentThunk,
  [deleteExperimentThunk.typePrefix]: deleteExperimentThunk,
  [uploadAttachmentThunk.typePrefix]: uploadAttachmentThunk,
  [fetchNotesThunk.typePrefix]: fetchNotesThunk,
  [createNoteThunk.typePrefix]: createNoteThunk,
  [updateNoteThunk.typePrefix]: updateNoteThunk,
  [deleteNoteThunk.typePrefix]: deleteNoteThunk,
  [toggleNoteFavoriteThunk.typePrefix]: toggleNoteFavoriteThunk,
  [searchNotesThunk.typePrefix]: searchNotesThunk,
  [fetchTagCountsThunk.typePrefix]: fetchTagCountsThunk,
  [createCustomTagThunk.typePrefix]: createCustomTagThunk,
  [fetchHardwareThunk.typePrefix]: fetchHardwareThunk,
  [addHardwareThunk.typePrefix]: addHardwareThunk,
  [updateHardwareThunk.typePrefix]: updateHardwareThunk,
  [deleteHardwareThunk.typePrefix]: deleteHardwareThunk,
  [fetchNotificationSettingsThunk.typePrefix]: fetchNotificationSettingsThunk,
  [saveNotificationSettingsThunk.typePrefix]: saveNotificationSettingsThunk,
  [fetchStorageUsageThunk.typePrefix]: fetchStorageUsageThunk,
  [manualSyncThunk.typePrefix]: manualSyncThunk,
  [processLocalSyncQueueThunk.typePrefix]: processLocalSyncQueueThunk,
  [flushOnboardingDraftThunk.typePrefix]: flushOnboardingDraftThunk,
};

const AUTO_RETRY_PREFIXES = new Set<string>([
  fetchProjectsThunk.typePrefix,
  fetchExperimentsThunk.typePrefix,
  fetchNotesThunk.typePrefix,
  fetchHardwareThunk.typePrefix,
  fetchProfileThunk.typePrefix,
  fetchTagCountsThunk.typePrefix,
  fetchNotificationSettingsThunk.typePrefix,
  fetchStorageUsageThunk.typePrefix,
  processLocalSyncQueueThunk.typePrefix,
  syncPendingProjectsThunk.typePrefix,
  syncPendingExperimentsThunk.typePrefix,
]);

export function getRetryThunk(typePrefix: string): RetryThunkCreator | null {
  return RETRYABLE_THUNKS[typePrefix] ?? null;
}

export function isAutoRetryType(typePrefix: string): boolean {
  return AUTO_RETRY_PREFIXES.has(typePrefix);
}

export function dispatchRetryOperation(dispatch: AppDispatch, retry: RetryDescriptor): boolean {
  const thunk = getRetryThunk(retry.typePrefix);
  if (!thunk) return false;
  dispatch(thunk(retry.arg));
  return true;
}
