import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, useWindowDimensions } from 'react-native';

/**
 * On web, `react-native-safe-area-context`/`react-native-screens` measure the
 * window once (via `Dimensions.get('window')`, no resize listener) and hand
 * that static frame to native-stack's screen container as explicit pixel
 * dimensions. Resizing the browser after load leaves screen content stuck at
 * the stale size (the header re-flows fine since it's plain CSS, unrelated to
 * this). `useWindowDimensions()` DOES track resizes live, so re-keying
 * `SafeAreaProvider` on width/height change forces it to re-measure instead
 * of keeping its first-render `initialMetrics`.
 *
 * Native platforms already get correct live measurements from the native
 * module, so this is a no-op passthrough there.
 */
export function WebSafeAreaProvider({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') {
    return children;
  }
  return <ResizingSafeAreaProvider>{children}</ResizingSafeAreaProvider>;
}

function ResizingSafeAreaProvider({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();

  return (
    <SafeAreaProvider
      key={`${width}x${height}`}
      initialMetrics={{
        frame: { x: 0, y: 0, width, height },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}>
      {children}
    </SafeAreaProvider>
  );
}
