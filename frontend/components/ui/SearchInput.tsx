import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

export type SearchInputVariant = 'homepage' | 'mapa';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  variant: SearchInputVariant;
  style?: any;
}

const SearchBox = styled.View<{ bgColor: string }>`
  flex-direction: row;
  align-items: center;
  height: ${({ theme }) => theme.height.sm}px;
  background-color: ${({ bgColor }) => bgColor};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const StyledInput = styled.TextInput<{ textColor: string }>`
  flex: 1;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.corpo.corpoTexto};
  include-font-padding: false;
  padding-vertical: 0px;
  line-height: ${({ theme }) => theme.text.corpo.corpoTexto.lineHeight}px;
`;

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search',
  value,
  onChangeText,
  variant,
  style,
}) => {
  // Acedemos ao theme do Styled Components para as cores dinâmicas
  const themeContext = useTheme();

  const SEARCH_THEME = {
    homepage: {
      backgroundColor: themeContext.colors.grayNavbar,
      iconColor: themeContext.colors.inactive,
      textColor: themeContext.colors.white,
    },
    mapa: {
      backgroundColor: themeContext.colors.background,
      iconColor: themeContext.colors.white,
      textColor: themeContext.colors.white,
    },
  } as const;

  const config = SEARCH_THEME[variant];

  return (
    <SearchBox style={style} bgColor={config.backgroundColor}>
      <Ionicons name="search" size={20} color={config.iconColor} />
      <StyledInput
        placeholder={placeholder}
        placeholderTextColor={config.iconColor}
        value={value}
        onChangeText={onChangeText}
        textColor={config.textColor}
      />
    </SearchBox>
  );
};

export default SearchInput;
