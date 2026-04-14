import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import styled from 'styled-components/native';

import { Colors, Fonts, Spacing, Height, Width } from '../../constants/theme';

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
  const headerHeight = statusBarHeight + Height.sm;

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
                accessibilityLabel="Safinity logo"
              />
            </LogoContainer>

            <IconRow>
              <IconButton
                onPress={() => router.push('/notifications')}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons
                  name="notifications-outline"
                  size={Width.iconHeader}
                  color={Colors.white}
                  accessible={false}
                />
              </IconButton>

              <IconButton
                onPress={() => router.push('/perfil/profile')}
                accessibilityRole="button"
                accessibilityLabel="Profile"
              >
                <Ionicons name="person-circle" size={Width.iconHeader} color={Colors.white} />
              </IconButton>
            </IconRow>
          </HeaderRow>
        )}

        {variant === 'back' && (
          <BackContainer>
            <BackButtonRow>
              <IconButton
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={Width.iconHeader} color={Colors.white} />
              </IconButton>
            </BackButtonRow>

            {title && (
              <TitleContainer>
                <Title accessibilityRole="header">{title}</Title>
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

/* ---------------- styled components ---------------- */

const HeaderFixedContainer = styled.View<{ height: number }>`
  position: absolute;
  top: 0;
  left: 0px; /* Altera de Spacing.margemLateral para 0 para o fundo cobrir tudo */
  right: 0px;
  padding-left: ${Spacing.margemLateral}px; /* Mantém a margem no conteúdo */
  padding-right: ${Spacing.margemLateral}px;
  z-index: 1000;
  background-color: transparent;
`;

const SafeArea = styled.View<{ height: number }>`
  height: ${({ height }) => height}px;
`;

const HeaderContent = styled.View`
  flex: 1;
  justify-content: center;
  height: auto;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BackContainer = styled.View`
  flex-direction: column;
  margin-top: ${Spacing.xl}px;
`;

const BackButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TitleContainer = styled.View``;

const LogoContainer = styled.View``;

const LogoImage = styled.Image`
  width: ${Width.logoHeader}px;
  height: ${Height.xs}px;
`;

const IconRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spacing.md}px;
`;

const IconButton = styled.Pressable``;

const Title = styled.Text`
  color: ${Colors.white};
  ${({ theme }) => theme.text.titulo.h};
  include-font-padding: false;
  margin-top: ${Spacing.md}px;
`;

const Divider = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
`;
