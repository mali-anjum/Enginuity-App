import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

export function BrandLogo() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: themeColors.heroTint,
            borderColor: themeColors.accentBorder,
          },
        ]}>
        <Text style={[styles.badgeText, { color: themeColors.heroPrimary }]}>E</Text>
      </View>
      <Text style={[styles.title, { color: themeColors.text }]}>Enginuity</Text>
      <Text style={[styles.subtitle, { color: themeColors.mutedText }]}>
        Build engineering momentum with clarity.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 30,
    fontWeight: '800',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
