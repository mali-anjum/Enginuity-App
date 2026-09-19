import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

// Monochrome-first, Notion-style palette: a single accent hue (blue) used
// sparingly for interactive/selected states, everything else is warm
// neutrals. `danger`/`success` stay separate hues since they're functional
// status colors, not decorative brand colors.
const brand = {
  blue500: '#2383E2',
  blueDark: '#5B9EF2',
  blueSoftLight: '#EAF3FC',
  blueSoftDark: '#1B2733',
  blueBorderLight: '#BFE0FB',
  blueBorderDark: '#2D4A66',
  red500: '#EB5757',
  redDark: '#E5484D',
  green600: '#2F9E44',
  greenDark: '#4CAF6D',
};

const neutral = {
  white: '#FFFFFF',
  offWhite: '#F7F7F5',
  hairline: '#E9E9E7',
  textDark: '#37352F',
  subtleGray: '#5A5854',
  mutedGray: '#9B9A97',
  black: '#191919',
  charcoal: '#202020',
  charcoalElevated: '#242424',
  charcoalBorder: '#2F2F2F',
  offBlackText: '#E9E9E7',
  mutedGrayDark: '#8F8F8D',
  subtleGrayDark: '#B9B9B6',
};

export const Colors = {
  light: {
    text: neutral.textDark,
    background: neutral.white,
    surface: neutral.offWhite,
    border: neutral.hairline,
    primary: brand.blue500,
    accent: brand.blue500,
    accentSoft: brand.blueSoftLight,
    accentBorder: brand.blueBorderLight,
    surfaceElevated: neutral.white,
    cardShadow: 'rgba(55, 53, 47, 0.06)',
    buttonPrimaryText: neutral.white,
    buttonSecondaryBackground: neutral.offWhite,
    buttonSecondaryText: neutral.textDark,
    buttonDangerBackground: brand.red500,
    buttonDangerText: neutral.white,
    buttonGhostBackground: neutral.offWhite,
    heroPrimary: brand.blue500,
    heroTint: brand.blueSoftLight,
    danger: brand.red500,
    success: brand.green600,
    headerBackground: neutral.offWhite,
    iconMuted: neutral.mutedGray,
    mutedText: neutral.mutedGray,
    subtleText: neutral.subtleGray,
    tint: brand.blue500,
    icon: neutral.mutedGray,
    tabIconDefault: neutral.mutedGray,
    tabIconSelected: brand.blue500,
  },
  dark: {
    text: neutral.offBlackText,
    background: neutral.black,
    surface: neutral.charcoal,
    border: neutral.charcoalBorder,
    primary: brand.blueDark,
    accent: brand.blueDark,
    accentSoft: brand.blueSoftDark,
    accentBorder: brand.blueBorderDark,
    surfaceElevated: neutral.charcoalElevated,
    cardShadow: 'rgba(0, 0, 0, 0.45)',
    buttonPrimaryText: neutral.white,
    buttonSecondaryBackground: neutral.charcoalElevated,
    buttonSecondaryText: neutral.offBlackText,
    buttonDangerBackground: brand.redDark,
    buttonDangerText: neutral.white,
    buttonGhostBackground: neutral.charcoalElevated,
    heroPrimary: brand.blueDark,
    heroTint: brand.blueSoftDark,
    danger: brand.redDark,
    success: brand.greenDark,
    headerBackground: neutral.charcoal,
    iconMuted: neutral.mutedGrayDark,
    mutedText: neutral.mutedGrayDark,
    subtleText: neutral.subtleGrayDark,
    tint: brand.blueDark,
    icon: neutral.mutedGrayDark,
    tabIconDefault: neutral.mutedGrayDark,
    tabIconSelected: brand.blueDark,
  },
};

export const NavigationThemes: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      background: Colors.light.background,
      card: Colors.light.surface,
      text: Colors.light.text,
      border: Colors.light.border,
      notification: Colors.light.primary,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.primary,
      background: Colors.dark.background,
      card: Colors.dark.surface,
      text: Colors.dark.text,
      border: Colors.dark.border,
      notification: Colors.dark.primary,
    },
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
