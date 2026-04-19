import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { IconSymbol } from '@/sharedModules/ui/atoms/icon-symbol';

type HomeEmptyProjectsProps = {
  onCreateProject: () => void;
};

export function HomeEmptyProjects({ onCreateProject }: HomeEmptyProjectsProps) {
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
      <View style={[styles.iconCircle, { backgroundColor: themeColors.heroTint }]}>
        <IconSymbol name="bolt.fill" size={36} color={themeColors.primary} />
      </View>
      <ThemedText type="subtitle" style={styles.title}>
        Start your first project
      </ThemedText>
      <ThemedText style={[styles.body, { color: themeColors.mutedText }]}>
        Projects hold experiments, hardware links, and activity. Create one to see your home feed come
        alive.
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create your first project"
        onPress={onCreateProject}
        style={[styles.cta, { backgroundColor: themeColors.primary }]}>
        <ThemedText
          lightColor={themeColors.buttonPrimaryText}
          darkColor={themeColors.buttonPrimaryText}
          type="defaultSemiBold">
          Create project
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  cta: {
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
});
