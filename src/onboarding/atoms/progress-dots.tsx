import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type ProgressDotsProps = {
  total: number;
  activeIndex: number;
};

export function ProgressDots({ total, activeIndex }: ProgressDotsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={`dot-${index}`}
          style={[
            styles.dot,
            {
              backgroundColor:
                index === activeIndex ? themeColors.accent : themeColors.border,
            },
            index === activeIndex ? styles.dotActive : undefined,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dotActive: {
    width: 24,
  },
});
