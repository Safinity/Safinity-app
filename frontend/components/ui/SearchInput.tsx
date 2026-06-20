import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Spacing, Height, BorderRadius, TextStyles } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export type SearchInputVariant = 'homepage' | 'mapa';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  variant: SearchInputVariant;
  style?: any;
}

const SearchBox = styled.View<{ $bgColor: string }>`
  flex-direction: row;
  align-items: center;
  height: ${Height.sm}px;
  background-color: ${({ $bgColor }) => $bgColor};
  border-radius: ${BorderRadius.large}px;
  padding: 0 ${Spacing.md}px;
`;

const StyledInput = styled.TextInput<{ $textColor: string }>`
  flex: 1;
  color: ${({ $textColor }) => $textColor};
  ${TextStyles.corpo.corpoTexto};
  include-font-padding: false;
  padding-vertical: 0px;
  line-height: ${TextStyles.corpo.corpoTexto.lineHeight}px;
`;

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search',
  value,
  onChangeText,
  variant,
  style,
}) => {
  const theme = useTheme();

  const SEARCH_THEME = {
    homepage: {
      backgroundColor: theme.colors.input,
      iconColor: theme.colors.textSubtle,
      textColor: theme.colors.text,
    },
    mapa: {
      backgroundColor: theme.colors.surface,
      iconColor: theme.colors.textSubtle,
      textColor: theme.colors.text,
    },
  } as const;

  const config = SEARCH_THEME[variant];

  return (
    <SearchBox style={style} $bgColor={config.backgroundColor}>
      <Ionicons name="search" size={20} color={config.iconColor} />
      <StyledInput
        placeholder={placeholder}
        placeholderTextColor={config.iconColor}
        value={value}
        onChangeText={onChangeText}
        $textColor={config.textColor}
        // Linhas novas:
        accessible={true}
        accessibilityLabel="Campo de pesquisa de eventos"
        // @ts-ignore
        aria-label="Campo de pesquisa de eventos"
        // novas LINHAS:
        required={false}
        // @ts-ignore
        aria-required="false"
      />
    </SearchBox>
  );
};

export default SearchInput;
