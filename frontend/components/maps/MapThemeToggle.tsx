import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';

const FloatingButton = styled.Pressable`
  position: absolute;
  /* Positioned specifically above the SOS button */
  margin-bottom: ${Spacing.sm}px;
  flex-direction: row;
  right: ${Spacing.md}px;
  width: 35px;
  height: 35px;
  border-radius: 28px;
  background-color: ${Colors.palette.primary.normal};
  justify-content: center;
  align-items: center;
  z-index: 90;
  elevation: 5;
  shadow-color: ${Colors.white};
  shadow-opacity: 0.3;
  shadow-radius: 2px;
  shadow-offset: 0px 2px;
`;

interface MapThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export const MapThemeToggle = ({ theme, onToggle }: MapThemeToggleProps) => {
  return (
    <FloatingButton onPress={onToggle}>
      <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={15} color={Colors.white} />
    </FloatingButton>
  );
};
