// app/constants/theme.ts
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base do design: iPhone 15 Pro Max
const BASE_WIDTH = 430; // largura em dp do iPhone 15 Pro Max
const BASE_HEIGHT = 932; // altura em dp do iPhone 15 Pro Max

// Funções de escala
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const moderateScale = (size: number, factor = 0.7) => size + (scale(size) - size) * factor;

// --- Cores ---
export const Colors = {
  grayNavbar: '#303B49',
  background: '#222734',
  primary: '#9242CC',
  primary_50: '#C9A0E5',
  inactive: '#b8b8be',
  white: '#FFFFFF',
  black: '#000000',
  neutralGray: '#666666',
  error: '#b74040',
  palette: {
    primary: {
      light90: '#F4ECFA',
      light80: '#E9D9F5',
      light60: '#D3B3EB',
      light50: '#C8A0E5',
      light40: '#BE8EE0',
      light20: '#9D55D1',
      normal: '#9242CC',
      dark20: '#7535A3',
      dark40: '#58267A',
      dark50: '#492166',
      dark60: '#3A1A52',
      dark80: '#1D0D29',
      dark90: '#0F0715',
    },
    secondary: {
      icyBlue: '#A3D9F2',
      turquoise: '#0FD6BF',
      deepSaffron: '#FF982A',
    },
    error: {
      light75: '#F4D2D2',
      light50: '#E9A4A4',
      normal: '#ff5252',
      dark50: '#6A2525',
      dark75: '#351313',
    },
    neutral: {
      neutral0: '#000000',
      neutral20: '#333333',
      neutral40: '#666666',
      neutral50: '#7F7F7F',
      neutral60: '#999999',
      neutral70: '#ABABAB',
      neutral80: '#CCCCCC',
      neutral100: '#FFFFFF',
    },
  },
};

const semanticDarkColors = {
  mode: 'dark' as const,
  surface: Colors.grayNavbar,
  surfaceElevated: Colors.grayNavbar,
  surfaceSoft: Colors.palette.primary.dark60,
  input: Colors.grayNavbar,
  border: Colors.grayNavbar,
  text: Colors.white,
  textMuted: Colors.inactive,
  textSubtle: Colors.palette.neutral.neutral60,
  icon: Colors.white,
  onPrimary: Colors.white,
  navBackground: Colors.grayNavbar,
  navActive: Colors.white,
  navInactive: Colors.palette.neutral.neutral80,
  shadow: 'rgba(0, 0, 0, 0.35)',
  profileGradientStart: 'rgba(190, 142, 224, 1)',
  profileGradientEnd: 'rgba(34, 39, 52, 0)',
};

const semanticLightColors = {
  mode: 'light' as const,
  grayNavbar: Colors.palette.primary.light90,
  background: Colors.white,
  inactive: Colors.palette.neutral.neutral50,
  white: Colors.background,
  surface: Colors.white,
  surfaceElevated: Colors.white,
  surfaceSoft: Colors.palette.primary.light90,
  input: Colors.palette.primary.light90,
  border: Colors.palette.primary.light80,
  text: Colors.background,
  textMuted: Colors.neutralGray,
  textSubtle: Colors.palette.neutral.neutral60,
  icon: Colors.primary_50,
  onPrimary: Colors.white,
  navBackground: Colors.white,
  navActive: Colors.primary,
  navInactive: Colors.palette.primary.light40,
  shadow: 'rgba(88, 38, 122, 0.16)',
  profileGradientStart: 'rgba(233, 217, 245, 1)',
  profileGradientEnd: 'rgba(255, 255, 255, 0)',
};

export const ThemeColors = {
  dark: {
    ...Colors,
    ...semanticDarkColors,
  },
  light: {
    ...Colors,
    ...semanticLightColors,
  },
};

export type ThemeMode = keyof typeof ThemeColors;

// --- Border radius ---
export const BorderRadius = {
  small: scale(8),
  medium: scale(16),
  large: scale(20),
  xlarge: scale(32),
  round: scale(999),
};

// --- Spacing ---
export const Spacing = {
  none: 0,
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(20),
  xl: scale(32),
  xxl: scale(130),
  xxxl: scale(170),
  margemLateral: scale(40),
  margemTop: scale(68),
};

export const Height = {
  separatorLine: scale(1),
  xs: scale(24),
  tam_42: scale(42),
  socialButton: scale(48),
  sm: scale(58),
  md: scale(73),
  landingLogo: Math.min(Math.max(SCREEN_WIDTH * 0.52, 190), 240) / 1.497,
  actionbutton: scale(120),
  profileAvatar: scale(160),
  friendProfileAvatar: scale(100),
  bottomMargem: scale(170),
  lg: scale(280),
  xl: scale(330),
  card: {
    compact: scale(240),
    default: scale(380),
  },
  gradientPadding: {
    compact: scale(15),
    default: scale(20),
  },
  timeBadge: {
    default: { vertical: scale(8), horizontal: scale(14) },
    compact: { vertical: scale(4), horizontal: scale(10) },
  },
};

export const Width = {
  logoHeader: scale(124),
  landingLogo: Math.min(Math.max(SCREEN_WIDTH * 0.52, 190), 240),
  iconAlert: scale(18),
  iconSocial: scale(18),
  iconSocialLarge: scale(19),
  iconHeader: scale(28),
  linkTicket: scale(50),
};

// --- Fonts ---
export const Fonts = {
  family: 'PlusJakartaSans',
  weights: {
    extralight: 'PlusJakartaSans_200ExtraLight',
    light: 'PlusJakartaSans_300Light',
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
  },
  sizes: {
    xs: moderateScale(11),
    sm: moderateScale(13),
    base: moderateScale(15),
    lg: moderateScale(17),
    xl: moderateScale(19),
  },
};

// --- Text styles ---
export const TextStyles = {
  botao: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: moderateScale(16),
    lineHeight: 22,
  },
  iconesNavbar: {
    fontFamily: 'PlusJakartaSans_200ExtraLight',
    fontSize: moderateScale(12),
    lineHeight: 22,
  },
  textoPequeno: {
    fontFamily: 'PlusJakartaSans_200ExtraLight',
    fontSize: moderateScale(14),
    lineHeight: 18,
  },
  label: {
    fontFamily: 'PlusJakartaSans_300Light',
    fontSize: moderateScale(12),
    lineHeight: 20,
  },
  textoFiltros: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: moderateScale(14),
    lineHeight: 22,
  },
  cardsCalendar: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: moderateScale(11),
    lineHeight: 14,
  },
  titulo: {
    h: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: moderateScale(24),
    },
    h1: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: moderateScale(22),
      lineHeight: 28,
    },
    h2: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: moderateScale(18),
      lineHeight: 22,
    },
    h3: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: moderateScale(16),
      lineHeight: 20,
    },
  },
  corpo: {
    corpoTexto: {
      fontFamily: 'PlusJakartaSans_300Light',
      fontSize: moderateScale(16),
      lineHeight: 22,
    },
  },
};

// --- Theme completo ---
export const theme = {
  colors: ThemeColors.dark,
  borderRadius: BorderRadius,
  spacing: Spacing,
  fonts: Fonts,
  text: TextStyles,
  height: Height,
  width: Width,
};

export type AppTheme = Omit<typeof theme, 'colors'> & {
  colors: (typeof ThemeColors)[ThemeMode];
};

export const darkTheme: AppTheme = theme;

export const lightTheme: AppTheme = {
  ...theme,
  colors: ThemeColors.light,
};
