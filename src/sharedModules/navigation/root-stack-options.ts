export const ROOT_STACK_SCREENS = {
  tabs: { name: '(tabs)', options: { headerShown: false } },
  onboarding: { name: 'onboarding/index', options: { title: 'Welcome', headerShown: true } },
  authLogin: { name: 'auth/login', options: { headerShown: false } },
  authCallback: { name: 'auth/callback', options: { headerShown: false } },
  modal: { name: 'modal', options: { presentation: 'modal', title: 'Modal' } },
} as const;
