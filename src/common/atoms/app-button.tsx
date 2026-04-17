import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { IconSymbol } from '@/sharedModules/ui/atoms/icon-symbol';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  iconName?: Parameters<typeof IconSymbol>[0]['name'];
  disabled?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  iconName,
  disabled = false,
}: AppButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const variantStyles = {
    primary: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
      textColor: themeColors.buttonPrimaryText,
    },
    secondary: {
      backgroundColor: themeColors.buttonSecondaryBackground,
      borderColor: themeColors.buttonSecondaryBackground,
      textColor: themeColors.buttonSecondaryText,
    },
    ghost: {
      backgroundColor: themeColors.buttonGhostBackground,
      borderColor: themeColors.border,
      textColor: themeColors.text,
    },
    danger: {
      backgroundColor: themeColors.buttonDangerBackground,
      borderColor: themeColors.buttonDangerBackground,
      textColor: themeColors.buttonDangerText,
    },
  } as const;

  const current = variantStyles[variant];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: current.backgroundColor,
          borderColor: current.borderColor,
        },
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}>
      <View style={styles.content}>
        {iconName ? <IconSymbol name={iconName} size={18} color={current.textColor} /> : null}
        <ThemedText
          type="defaultSemiBold"
          lightColor={current.textColor}
          darkColor={current.textColor}
          style={styles.label}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
  },
  pressed: {
    opacity: 0.87,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
