import { Background } from '@react-navigation/elements';
import { Platform } from 'react-native';

/**
 * Design tokens da aplicação
 * Podem ser usados em styled-components via theme
 */

export const Colors = {
  grayNavbar: '#303B49',
  background: '#222734',
  primary: '#9242CC',
  inactive: '#A0A0A5',
  white: '#FFFFFF',
};

export const BorderRadius = {
  small: 8,
  medium: 16,
  large: 24,
  round: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
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

/**
 * Theme usado pelo styled-components
 */
export const theme = {
  colors: Colors,
  borderRadius: BorderRadius,
  spacing: Spacing,
  fonts: Fonts,
};
