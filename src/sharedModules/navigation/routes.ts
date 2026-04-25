import type { Href } from 'expo-router';

export const ROUTES = {
  HOME: '/' as const,
  ONBOARDING: '/onboarding' as const,
  ONBOARDING_FOCUS: '/onboarding/focus' as const,
  ONBOARDING_EDUCATION: '/onboarding/education' as const,
  ONBOARDING_USAGE: '/onboarding/usage' as const,
  ONBOARDING_GOALS: '/onboarding/goals' as const,
  ONBOARDING_REVIEW: '/onboarding/review' as const,

  AUTH_LOGIN: '/auth/login' as const,
  AUTH_LOGIN_EMAIL: '/auth/login-email' as const,
  AUTH_SIGNUP: '/auth/signup' as const,
  AUTH_SIGNUP_EMAIL: '/auth/signup-email' as const,
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password' as const,
  AUTH_RESET_PASSWORD: '/auth/reset-password' as const,

  SEARCH: '/search' as const,
  PROJECT_LIST: '/project' as const,
  PROJECT_CREATE: '/project/create' as const,
  EXPERIMENT_LIST: '/experiment' as const,
  EXPERIMENT_CREATE: '/experiment/create' as const,
  NOTES_LIST: '/notes' as const,
  NOTES_CREATE: '/notes/create' as const,
  NOTES_TAGS: '/notes/tags' as const,
  HARDWARE_LIST: '/hardware' as const,
  HARDWARE_ADD: '/hardware/add' as const,
  PROFILE_HOME: '/profile' as const,
  PROFILE_EDIT: '/profile/edit' as const,
  PROFILE_AVATAR: '/profile/avatar' as const,
  PROFILE_STATISTICS: '/profile/statistics' as const,
  SETTINGS_HOME: '/settings' as const,
  SETTINGS_UPGRADE: '/settings/upgrade' as const,
} as const;

export const ROUTE_PATHS = {
  AUTH_LOGIN_WITH_NOTICE: (notice: string): Href =>
    `${ROUTES.AUTH_LOGIN}?notice=${encodeURIComponent(notice)}` as Href,
  NOTES_TAGS_WITH_TAG: (tag: string): Href =>
    `${ROUTES.NOTES_TAGS}?tag=${encodeURIComponent(tag)}` as Href,
  PROJECT_DETAIL: (projectId: string): Href => `/project/${projectId}` as Href,
  PROJECT_EDIT: (projectId: string): Href => `/project/${projectId}/edit` as Href,
  EXPERIMENT_DETAIL: (experimentId: string): Href =>
    `/experiment/${experimentId}` as Href,
  EXPERIMENT_EDIT: (experimentId: string): Href =>
    `/experiment/${experimentId}/edit` as Href,
  EXPERIMENT_CREATE_FOR_PROJECT: (projectId: string): Href =>
    `${ROUTES.EXPERIMENT_CREATE}?projectId=${encodeURIComponent(projectId)}` as Href,
  NOTES_CREATE_FOR_EXPERIMENT: (experimentId: string): Href =>
    `${ROUTES.NOTES_CREATE}?experimentId=${encodeURIComponent(experimentId)}` as Href,
  NOTES_CREATE_FOR_PROJECT: (projectId: string): Href =>
    `${ROUTES.NOTES_CREATE}?projectId=${encodeURIComponent(projectId)}` as Href,
  NOTES_CREATE_FOR_EXPERIMENT_WITH_TITLE: (
    experimentId: string,
    title: string,
  ): Href =>
    `${ROUTES.NOTES_CREATE}?experimentId=${encodeURIComponent(experimentId)}&title=${encodeURIComponent(title)}` as Href,
  EXPERIMENT_ATTACHMENT_VIEWER: (
    url: string,
    fileName: string,
    fileType: string,
  ): Href =>
    `/experiment/attachment-viewer?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}&type=${encodeURIComponent(fileType)}` as Href,
  NOTE_DETAIL: (noteId: string): Href => `/notes/${noteId}` as Href,
  NOTE_EDIT: (noteId: string): Href => `/notes/${noteId}/edit` as Href,
  HARDWARE_DETAIL: (hardwareId: string): Href =>
    `/hardware/${hardwareId}` as Href,
  HARDWARE_EDIT: (hardwareId: string): Href =>
    `/hardware/${hardwareId}/edit` as Href,
} as const;
