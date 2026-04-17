import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

const brand = {
  teal500: '#0F766E',
  teal600: '#0D9488',
  blue500: '#2563EB',
  blue600: '#1D4ED8',
  blue50: '#EFF6FF',
  blue200: '#BFDBFE',
  violet500: '#7C3AED',
  violet600: '#6D28D9',
  red500: '#B00020',
};

const neutral = {
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
};

export const Colors = {
  light: {
    text: neutral.slate900,
    background: neutral.white,
    surface: neutral.slate50,
    border: neutral.slate100,
    primary: brand.teal500,
    accent: brand.blue500,
    accentSoft: brand.blue50,
    accentBorder: brand.blue200,
    surfaceElevated: neutral.white,
    cardShadow: 'rgba(15, 23, 42, 0.08)',
    buttonPrimaryText: neutral.white,
    buttonGhostBackground: neutral.slate50,
    heroPrimary: brand.blue600,
    heroSecondary: brand.violet500,
    heroTint: '#E0E7FF',
    danger: brand.red500,
    headerBackground: neutral.slate100,
    iconMuted: neutral.slate400,
    mutedText: neutral.slate500,
    subtleText: neutral.slate700,
    tint: brand.teal500,
    icon: neutral.slate500,
    tabIconDefault: neutral.slate500,
    tabIconSelected: brand.teal500,
  },
  dark: {
    text: neutral.slate50,
    background: neutral.slate900,
    surface: neutral.slate800,
    border: neutral.slate700,
    primary: brand.teal600,
    accent: brand.blue500,
    accentSoft: neutral.slate800,
    accentBorder: neutral.slate700,
    surfaceElevated: '#111827',
    cardShadow: 'rgba(15, 23, 42, 0.35)',
    buttonPrimaryText: neutral.white,
    buttonGhostBackground: '#172033',
    heroPrimary: brand.blue500,
    heroSecondary: brand.violet600,
    heroTint: '#172554',
    danger: '#FF6B6B',
    headerBackground: neutral.slate800,
    iconMuted: neutral.slate400,
    mutedText: neutral.slate400,
    subtleText: neutral.slate300,
    tint: brand.teal600,
    icon: neutral.slate400,
    tabIconDefault: neutral.slate400,
    tabIconSelected: brand.teal600,
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
