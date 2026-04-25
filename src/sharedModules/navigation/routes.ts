import type { Href } from "expo-router";

export const ROUTES = {
  home: "/" as const,
  onboarding: "/onboarding" as const,
  onboardingFocus: "/onboarding/focus" as const,
  onboardingEducation: "/onboarding/education" as const,
  onboardingUsage: "/onboarding/usage" as const,
  onboardingGoals: "/onboarding/goals" as const,
  onboardingReview: "/onboarding/review" as const,

  authLogin: "/auth/login" as const,
  authLoginEmail: "/auth/login-email" as const,
  authSignup: "/auth/signup" as const,
  authSignupEmail: "/auth/signup-email" as const,
  authForgotPassword: "/auth/forgot-password" as const,
  authResetPassword: "/auth/reset-password" as const,

  search: "/search" as const,
  projectList: "/project" as const,
  projectCreate: "/project/create" as const,
  experimentList: "/experiment" as const,
  experimentCreate: "/experiment/create" as const,
  notesList: "/notes" as const,
  notesCreate: "/notes/create" as const,
  notesTags: "/notes/tags" as const,
  hardwareList: "/hardware" as const,
  hardwareAdd: "/hardware/add" as const,
  profileHome: "/profile" as const,
  profileEdit: "/profile/edit" as const,
  profileAvatar: "/profile/avatar" as const,
  profileStatistics: "/profile/statistics" as const,
  settingsHome: "/settings" as const,
  settingsUpgrade: "/settings/upgrade" as const,
} as const;

export const routePaths = {
  authLoginWithNotice: (notice: string): Href =>
    `${ROUTES.authLogin}?notice=${encodeURIComponent(notice)}` as Href,
  notesTagsWithTag: (tag: string): Href =>
    `${ROUTES.notesTags}?tag=${encodeURIComponent(tag)}` as Href,
  projectDetail: (projectId: string): Href => `/project/${projectId}` as Href,
  experimentDetail: (experimentId: string): Href =>
    `/experiment/${experimentId}` as Href,
  experimentEdit: (experimentId: string): Href =>
    `/experiment/${experimentId}/edit` as Href,
  experimentCreateForProject: (projectId: string): Href =>
    `${ROUTES.experimentCreate}?projectId=${encodeURIComponent(projectId)}` as Href,
  notesCreateForExperiment: (experimentId: string): Href =>
    `${ROUTES.notesCreate}?experimentId=${encodeURIComponent(experimentId)}` as Href,
  notesCreateForExperimentWithTitle: (
    experimentId: string,
    title: string,
  ): Href =>
    `${ROUTES.notesCreate}?experimentId=${encodeURIComponent(experimentId)}&title=${encodeURIComponent(title)}` as Href,
  experimentAttachmentViewer: (
    url: string,
    fileName: string,
    fileType: string,
  ): Href =>
    `/experiment/attachment-viewer?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}&type=${encodeURIComponent(fileType)}` as Href,
  noteDetail: (noteId: string): Href => `/notes/${noteId}` as Href,
  noteEdit: (noteId: string): Href => `/notes/${noteId}/edit` as Href,
  hardwareDetail: (hardwareId: string): Href =>
    `/hardware/${hardwareId}` as Href,
  hardwareEdit: (hardwareId: string): Href =>
    `/hardware/${hardwareId}/edit` as Href,
} as const;
