import React from 'react';
import { Platform, StatusBar } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';

interface HeaderProps {
  showIcons?: boolean;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  showBottomDivider?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  showIcons = true,
  onNotificationPress,
  onProfilePress,
  showBottomDivider = false,
}) => {

  // Cálculo da altura: Safe Area (status bar) + 60px de conteúdo
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  const headerHeight = statusBarHeight + 60;

  return (
    <HeaderFixedContainer height={headerHeight}>
      <SafeArea height={statusBarHeight} />
      <HeaderContent>
        <HeaderRow>
          <LogoContainer>
            <LogoImage
              source={require('../../assets/logos/logo-header.png')}
              resizeMode="contain"
            />
          </LogoContainer>

          {showIcons && (
            <IconRow>
              <IconButton onPress={onNotificationPress}>
                <Ionicons name="notifications-outline" size={24} color={Colors.white} />
              </IconButton>
              <IconButton onPress={onProfilePress}>
                <Ionicons name="person-circle" size={30} color={Colors.white} />
              </IconButton>
            </IconRow>
          )}
        </HeaderRow>

        {showBottomDivider && <Divider />}
      </HeaderContent>
    </HeaderFixedContainer>
  );
};

// Estilos Styled Components

const HeaderFixedContainer = styled.View<{ height: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: ${({ height }) => height}px;
  background-color: transparent; /* Garante que a imagem por baixo apareça */
`;

const SafeArea = styled.View<{ height: number }>`
  height: ${({ height }) => height}px;
`;

const HeaderContent = styled.View`
  flex: 1;
  padding: 0 ${Spacing.md}px;
  justify-content: center;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const LogoContainer = styled.View``;

const LogoImage = styled.Image`
  width: 124px;
  height: 24px;
`;

const IconRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.md}px;
  align-items: center;
`;

const IconButton = styled.Pressable`
  padding: 4px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

export default Header;
