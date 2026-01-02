import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface SearchInputProps {
  placeholder?: string;
  placeholderTextColor?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: any;
}

const SearchBox = styled.View`
  flex-direction: row;
  align-items: center;
  height: 58px;
  background-color: ${Colors.grayNavbar};
  border-radius: ${BorderRadius.large}px;
  padding: ${Spacing.sm}px ${Spacing.md}px;
  margin-bottom: ${Spacing.md}px;
`;

const StyledInput = styled.TextInput`
  flex: 1;
  color: ${Colors.white};
  margin-left: ${Spacing.sm}px;
  font-size: 16px;
`;

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search',
  placeholderTextColor = Colors.inactive,
  value,
  onChangeText,
  style,
}) => {
  return (
    <SearchBox style={style}>
      <Ionicons name="search" size={18} color={placeholderTextColor} />
      <StyledInput
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
      />
    </SearchBox>
  );
};

export default SearchInput;
