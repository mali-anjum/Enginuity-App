import { Platform } from 'react-native';

const brand = {
  cyan500: '#0A7EA4',
};

const neutral = {
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate700: '#334155',
  slate900: '#0F172A',
};

export const Colors = {
  light: {
    // Semantic tokens for scalable app theming.
    text: neutral.slate900,
    background: neutral.white,
    surface: neutral.slate50,
    border: neutral.slate100,
    primary: brand.cyan500,
    mutedText: neutral.slate500,
    tint: brand.cyan500,
    icon: neutral.slate500,
    tabIconDefault: neutral.slate500,
    tabIconSelected: brand.cyan500,
  },
  dark: {
    text: neutral.slate50,
    background: neutral.slate900,
    surface: neutral.slate700,
    border: neutral.slate700,
    primary: neutral.white,
    mutedText: neutral.slate400,
    tint: neutral.white,
    icon: neutral.slate400,
    tabIconDefault: neutral.slate400,
    tabIconSelected: neutral.white,
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
