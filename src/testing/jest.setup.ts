import React from 'react';

// Smoke-render tests only exercise rendering, not real navigation, so
// expo-router is mocked globally here rather than per test file — this
// guarantees the mock is registered before any screen module (which imports
// expo-router) is required.
jest.mock('expo-router', () => {
  const actualReact = jest.requireActual('react') as typeof React;

  const useRouter = () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => false,
    setParams: jest.fn(),
  });

  const useLocalSearchParams = () => ({});
  const useSegments = () => [];

  const Link = ({ children }: { children?: React.ReactNode }) =>
    actualReact.createElement(actualReact.Fragment, null, children);

  const Screen = () => null;
  const Stack = Object.assign(
    ({ children }: { children?: React.ReactNode }) =>
      actualReact.createElement(actualReact.Fragment, null, children),
    { Screen },
  );
  const Tabs = Object.assign(
    ({ children }: { children?: React.ReactNode }) =>
      actualReact.createElement(actualReact.Fragment, null, children),
    { Screen },
  );

  return {
    useRouter,
    useLocalSearchParams,
    useSegments,
    Link,
    Stack,
    Tabs,
    Redirect: () => null,
  };
});
