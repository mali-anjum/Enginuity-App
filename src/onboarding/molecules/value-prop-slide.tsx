import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type ValuePropSlideProps = {
  title: string;
  description: string;
  emoji: string;
};

export function ValuePropSlide({ title, description, emoji }: ValuePropSlideProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.surfaceElevated,
          borderColor: themeColors.accentBorder,
          shadowColor: themeColors.cardShadow,
        },
      ]}>
      <View style={[styles.emojiWrap, { backgroundColor: themeColors.accentSoft }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: themeColors.subtleText }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  emojiWrap: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
});
