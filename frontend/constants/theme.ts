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
  black: '#000000',
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

export const BorderRadius = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  round: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32,
  xxl: 130,
  margemLateral: 40,
};

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
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 19,
  },
};

export const TextStyles = {
  botao: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    lineHeight: 22,
  },
  iconesNavbar: {
    fontFamily: 'PlusJakartaSans_200ExtraLight',
    fontSize: 12,
    lineHeight: 22,
  },
  textoPequeno: {
    fontFamily: 'PlusJakartaSans_200ExtraLight',
    fontSize: 14,
    lineHeight: 18,
  },
  label: {
    fontFamily: 'PlusJakartaSans_300Light',
    fontSize: 10,
    lineHeight: 20,
  },
  textoFiltros: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  cardsCalendar: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    lineHeight: 14,
  },
  titulo: {
    h1: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: 22,
      lineHeight: 28,
    },
    h2: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: 18,
      lineHeight: 22,
    },
    h3: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: 16,
      lineHeight: 20,
    },
  },
  corpo: {
    corpoTexto: {
      fontFamily: 'PlusJakartaSans_300Light',
      fontSize: 16,
      lineHeight: 22,
    },
  },
};

export const theme = {
  colors: Colors,
  borderRadius: BorderRadius,
  spacing: Spacing,
  fonts: Fonts,
  text: TextStyles,
};
