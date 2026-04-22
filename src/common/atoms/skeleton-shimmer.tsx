import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type SkeletonShimmerProps = {
  style?: StyleProp<ViewStyle>;
};

export function SkeletonShimmer({ style }: SkeletonShimmerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const shimmerX = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 320,
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerX]);

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colorScheme === 'dark' ? themeColors.surfaceElevated : '#E2E8F0',
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.55)',
            transform: [{ translateX: shimmerX }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 140,
  },
});
