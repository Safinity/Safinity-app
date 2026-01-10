import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

export type SearchInputVariant = 'homepage' | 'mapa';

const SEARCH_THEME = {
  homepage: {
    backgroundColor: Colors.grayNavbar,
    iconColor: Colors.inactive,
    textColor: Colors.white,
  },
  mapa: {
    backgroundColor: Colors.background,
    iconColor: Colors.white,
    textColor: Colors.white,
  },
} as const;

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
  height: 58px;
  background-color: ${({ bgColor }) => bgColor};
  border-radius: ${BorderRadius.large}px;
  padding: ${Spacing.sm}px ${Spacing.md}px;
`;

const StyledInput = styled.TextInput<{ textColor: string }>`
  flex: 1;
  color: ${({ textColor }) => textColor};
  margin-left: ${Spacing.sm}px;
  font-size: 16px;
`;

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search',
  value,
  onChangeText,
  variant,
  style,
}) => {
  const theme = SEARCH_THEME[variant];

  return (
    <SearchBox style={style} bgColor={theme.backgroundColor}>
      <Ionicons name="search" size={18} color={theme.iconColor} />
      <StyledInput
        placeholder={placeholder}
        placeholderTextColor={theme.iconColor}
        value={value}
        onChangeText={onChangeText}
        textColor={theme.textColor}
      />
    </SearchBox>
  );
};

export default SearchInput;
