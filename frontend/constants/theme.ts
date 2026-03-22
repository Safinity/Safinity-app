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
  inactive: '#A0A0A5',
  white: '#FFFFFF',
  black: '#000000',
  neutralGray: '#666666',
  error: '#D34A4A',
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
      normal: '#D34A4A',
      dark50: '#6A2525',
      dark75: '#351313',
    },
    neutral: {
      neutral0: '#000000',
      neutral20: '#333333',
      neutral40: '#666666',
      neutral50: '#7F7F7F',
      neutral60: '#999999',
      neutral80: '#CCCCCC',
      neutral100: '#FFFFFF',
    },
  },
};

// --- Border radius ---
export const BorderRadius = {
  small: scale(8),
  medium: scale(16),
  large: scale(24),
  xlarge: scale(32),
  round: scale(999),
};

// --- Spacing ---
export const Spacing = {
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
  xs: scale(24),
  tam_42: scale(42),
  sm: scale(58),
  md: scale(73),
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
  colors: Colors,
  borderRadius: BorderRadius,
  spacing: Spacing,
  fonts: Fonts,
  text: TextStyles,
  height: Height,
  width: Width,
};
