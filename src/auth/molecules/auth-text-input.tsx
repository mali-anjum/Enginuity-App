import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type AuthTextInputProps = TextInputProps;

export function AuthTextInput(props: AuthTextInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <TextInput
      {...props}
      placeholderTextColor={themeColors.mutedText}
      style={[
        styles.input,
        {
          borderColor: themeColors.border,
          backgroundColor: themeColors.surfaceElevated,
          color: themeColors.text,
        },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
