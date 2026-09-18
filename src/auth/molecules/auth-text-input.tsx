import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, Radii, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { IconSymbol } from '@/sharedModules/ui/atoms/icon-symbol';

type AuthTextInputProps = TextInputProps & {
  /** Renders an eye icon that toggles password visibility instead of using `secureTextEntry` directly. */
  secureToggle?: boolean;
};

export function AuthTextInput({ secureToggle, style, ...props }: AuthTextInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputStyle = [
    styles.input,
    secureToggle ? styles.inputWithToggle : null,
    {
      borderColor: themeColors.border,
      backgroundColor: themeColors.surfaceElevated,
      color: themeColors.text,
    },
    style,
  ];

  if (!secureToggle) {
    return <TextInput {...props} placeholderTextColor={themeColors.mutedText} style={inputStyle} />;
  }

  return (
    <View style={styles.toggleWrap}>
      <TextInput
        {...props}
        secureTextEntry={!isPasswordVisible}
        placeholderTextColor={themeColors.mutedText}
        style={inputStyle}
      />
      <Pressable
        onPress={() => setIsPasswordVisible((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
        hitSlop={8}
        style={styles.toggleButton}>
        <IconSymbol
          name={isPasswordVisible ? 'eye.slash' : 'eye'}
          size={20}
          color={themeColors.mutedText}
        />
      </Pressable>
    </View>
  );
}

// Toggle hit-area sized to the 44pt minimum recommended touch target
// (iOS HIG / Material), derived from the Spacing scale rather than hand-picked.
const TOGGLE_HIT_SIZE = Spacing.xxxl + Spacing.md; // 44
const TOGGLE_RIGHT_INSET = Spacing.xs;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.md,
    fontSize: 15,
  },
  toggleWrap: {
    justifyContent: 'center',
  },
  inputWithToggle: {
    paddingRight: TOGGLE_HIT_SIZE + TOGGLE_RIGHT_INSET,
  },
  toggleButton: {
    position: 'absolute',
    right: TOGGLE_RIGHT_INSET,
    height: '100%',
    width: TOGGLE_HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
