export const ROOT_STACK_SCREENS = {
  tabs: { name: '(tabs)', options: { headerShown: false } },
  onboarding: { name: 'onboarding/index', options: { title: 'Welcome', headerShown: true } },
  projectList: { name: 'project/index', options: { title: 'Projects', headerShown: true } },
  projectCreate: { name: 'project/create', options: { title: 'Create project', headerShown: true } },
  projectDetail: { name: 'project/[projectId]', options: { title: 'Project detail', headerShown: true } },
  projectEdit: { name: 'project/[projectId]/edit', options: { title: 'Edit project', headerShown: true } },
  authSplash: { name: 'auth/splash', options: { headerShown: false } },
  authLogin: { name: 'auth/login', options: { headerShown: false } },
  authSignup: { name: 'auth/signup', options: { title: 'Create account', headerShown: true } },
  authForgotPassword: {
    name: 'auth/forgot-password',
    options: { title: 'Forgot password', headerShown: true },
  },
  authResetPassword: {
    name: 'auth/reset-password',
    options: { title: 'Reset password', headerShown: true },
  },
  authCallback: { name: 'auth/callback', options: { headerShown: false } },
  modal: { name: 'modal', options: { presentation: 'modal', title: 'Modal' } },
} as const;
