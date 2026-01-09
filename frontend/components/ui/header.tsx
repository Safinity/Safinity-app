import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import styled from 'styled-components/native';

import { Colors, Fonts, Spacing } from '../../constants/theme';

export type HeaderVariant = 'default' | 'back';

interface HeaderProps {
  variant?: HeaderVariant;
  showBottomDivider?: boolean;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  showBottomDivider = false,
  title,
}) => {
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

  const headerHeight = statusBarHeight + 60;

  return (
    <HeaderFixedContainer height={headerHeight}>
      <SafeArea height={statusBarHeight} />

      <HeaderContent>
        {variant === 'default' && (
          <HeaderRow>
            <LogoContainer>
              <LogoImage
                source={require('../../assets/logos/logo-header.png')}
                resizeMode="contain"
              />
            </LogoContainer>

            <IconRow>
              <IconButton>
                <Ionicons name="notifications-outline" size={24} color={Colors.white} />
              </IconButton>

              <IconButton onPress={() => router.push('/perfil/profile')}>
                <Ionicons name="person-circle" size={30} color={Colors.white} />
              </IconButton>
            </IconRow>
          </HeaderRow>
        )}

        {variant === 'back' && (
          <BackContainer>
            <BackButtonRow>
              <IconButton onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={26} color={Colors.white} />
              </IconButton>
            </BackButtonRow>

            {title && (
              <TitleContainer>
                <Title>{title}</Title>
              </TitleContainer>
            )}
          </BackContainer>
        )}

        {showBottomDivider && <Divider />}
      </HeaderContent>
    </HeaderFixedContainer>
  );
};

export default Header;

const HeaderFixedContainer = styled.View<{ height: number }>`
  position: absolute;
  top: 0;
  left: ${Spacing.margemLateral}px;
  right: ${Spacing.margemLateral}px;
  z-index: 1000;
  height: ${({ height }) => height}px;
  background-color: transparent;
`;

const SafeArea = styled.View<{ height: number }>`
  height: ${({ height }) => height}px;
`;

const HeaderContent = styled.View`
  flex: 1;
  justify-content: center;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BackContainer = styled.View`
  flex-direction: column;
`;

const BackButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 25px;
  margin-bottom: ${Spacing.md}px;
`;

const TitleContainer = styled.View`
  font-size: 24px;
`;

const LogoContainer = styled.View``;

const LogoImage = styled.Image`
  width: 124px;
  height: 24px;
`;

const IconRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spacing.md}px;
`;

const IconButton = styled.Pressable``;

const Title = styled.Text`
  color: ${Colors.white};
  font-family: ${Fonts.weights.semibold};
  font-size: 18px;
  include-font-padding: false;
  font-variant-ligatures: none;
  font-variant: none;
`;
const Divider = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
`;
