import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { IconSymbol } from '@/sharedModules/ui/atoms/icon-symbol';

type ListEmptyStateProps = {
  icon: string;
  headline: string;
  body: string;
  ctaLabel: string;
  onPressCta: () => void;
};

export function ListEmptyState({
  icon,
  headline,
  body,
  ctaLabel,
  onPressCta,
}: ListEmptyStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <ThemedView
      style={[
        styles.card,
        {
          borderColor: themeColors.border,
          backgroundColor: themeColors.surfaceElevated,
        },
      ]}>
      <View style={[styles.illustrationCircle, { backgroundColor: themeColors.heroTint }]}>
        <IconSymbol name={icon as never} size={34} color={themeColors.primary} />
      </View>
      <ThemedText type="subtitle" style={styles.headline}>
        {headline}
      </ThemedText>
      <ThemedText style={[styles.body, { color: themeColors.mutedText }]}>{body}</ThemedText>
      <Pressable
        accessibilityRole="button"
        style={[styles.cta, { backgroundColor: themeColors.primary }]}
        onPress={onPressCta}>
        <ThemedText
          lightColor={themeColors.buttonPrimaryText}
          darkColor={themeColors.buttonPrimaryText}
          type="defaultSemiBold">
          {ctaLabel}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  illustrationCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },
  cta: {
    marginTop: 6,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
});
