import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedView, type ThemedViewProps } from '@/common/atoms/themed-view';
import { Spacing } from '@/common/constants/theme';

export type ScreenContainerProps = ThemedViewProps & {
  contentStyle?: ViewProps['style'];
  maxWidth?: number;
};

/**
 * Root wrapper for screens. On native it's a plain `ThemedView`. On web it
 * additionally centers content within `maxWidth` so screens don't stretch
 * full-bleed at desktop widths — the one place this is handled, instead of
 * per-screen width logic.
 */
export function ScreenContainer({
  style,
  contentStyle,
  maxWidth = 720,
  children,
  ...rest
}: ScreenContainerProps) {
  return (
    <ThemedView style={[styles.root, style]} {...rest}>
      <View style={[styles.content, Platform.OS === 'web' && { maxWidth, alignSelf: 'center', width: '100%' }, contentStyle]}>
        {children}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: Platform.OS === 'web' ? Spacing.xl : 0,
  },
});
