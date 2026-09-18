import { Text, type TextProps, type TextStyle } from 'react-native';

import { useThemeColor } from '@/common/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default'
    | 'title'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'link'
    | 'display'
    | 'heading'
    | 'caption'
    | 'eyebrow';
};

const textTypeStyles: Record<NonNullable<ThemedTextProps['type']>, TextStyle> = {
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
  },
  // Page-level hero text, one step above `title` (e.g. onboarding).
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  // Section-level header, between `title` and `subtitle` in weight of emphasis.
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  // De-emphasized metadata: timestamps, helper text, counts.
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Small tracked uppercase label for subsection grouping (e.g. "MY PROJECTS").
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorToken = type === 'link' ? 'primary' : 'text';
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorToken);
  const variantStyle = textTypeStyles[type];

  return (
    <Text
      style={[
        { color },
        variantStyle,
        style,
      ]}
      {...rest}
    />
  );
}
