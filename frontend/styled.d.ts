import 'styled-components';
import {
  Colors,
  BorderRadius,
  Spacing,
  Fonts,
  TextStyles,
  Height,
  Width,
} from '../constants/theme';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof Colors;
    borderRadius: typeof BorderRadius;
    spacing: typeof Spacing;
    fonts: typeof Fonts;
    text: typeof TextStyles;
    height: typeof Height;
    width: typeof Width;
  }
}
