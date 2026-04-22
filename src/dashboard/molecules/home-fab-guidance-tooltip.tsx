import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type HomeFabGuidanceTooltipProps = {
  message: string;
};

export function HomeFabGuidanceTooltip({ message }: HomeFabGuidanceTooltipProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View
        style={[
          styles.bubble,
          {
            borderColor: themeColors.border,
            backgroundColor: themeColors.surfaceElevated,
          },
        ]}>
        <ThemedText style={{ color: themeColors.text }}>{message}</ThemedText>
      </View>
      <View
        style={[
          styles.arrow,
          {
            borderTopColor: themeColors.surfaceElevated,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 20,
    bottom: 92,
    width: 250,
    alignItems: 'flex-end',
    zIndex: 50,
  },
  bubble: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  arrow: {
    marginRight: 18,
    marginTop: -1,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
