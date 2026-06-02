import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      grayNavbar: string;
      background: string;
      primary: string;
      primary_50: string;
      inactive: string;
      white: string;
      black: string;
      neutralGray: string;
      error: string;
      palette: any;
    };
    borderRadius: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
      round: number;
    };
    spacing: {
      xxs: number;
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
      margemLateral: number;
      margemTop: number;
    };
    fonts: {
      family: string;
      weights: any;
      sizes: any;
    };
    text: {
      botao: any;
      iconesNavbar: any;
      textoPequeno: any;
      label: any;
      textoFiltros: any;
      cardsCalendar: any;
      titulo: {
        h: any;
        h1: any;
        h2: any;
        h3: any;
      };
      corpo: {
        corpoTexto: any;
      };
    };
    height: any;
    width: any;
  }
}
