import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import styled from 'styled-components/native';

import { Colors, Spacing, Height, Width, BorderRadius, TextStyles } from '../../constants/theme';
import { navigateToPreviousRoute } from '../../utils/navigationHistory';

export type HeaderVariant = 'default' | 'back' | 'pageDetails';

interface HeaderProps {
  variant?: HeaderVariant;
  showBottomDivider?: boolean;
  title?: string;
  subtitle?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  showBottomDivider = false,
  title,
  subtitle,
  rightIcon,
  onRightPress,
}) => {
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

  const hasText = Boolean(title || subtitle);

  return (
    <HeaderFixedContainer>
      <SafeArea height={statusBarHeight} />

      <HeaderContent>
        {/* DEFAULT HEADER */}
        {variant === 'default' && (
          <HeaderRow>
            <LogoContainer>
              <LogoImage
                source={require('../../assets/logos/logo-header.png')}
                resizeMode="contain"
              />
            </LogoContainer>

            <IconRow>
              <IconButton
                onPress={() => router.push('/notifications')}
                role="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons
                  name="notifications-outline"
                  size={Width.iconHeader}
                  color={Colors.white}
                />
              </IconButton>

              <IconButton
                onPress={() => router.push('/perfil/profile')}
                role="button"
                accessibilityLabel="Profile"
              >
                <Ionicons name="person-circle" size={Width.iconHeader} color={Colors.white} />
              </IconButton>
            </IconRow>
          </HeaderRow>
        )}

        {/* BACK HEADER */}
        {variant === 'back' && (
          <BackContainer hasText={hasText}>
            <BackButtonRow>
              <BackButton
                onPress={() => navigateToPreviousRoute()}
                accessibilityLabel="Go back"
                role="button"
              >
                <Ionicons name="arrow-back" size={Width.iconHeader} color={Colors.white} />
              </BackButton>

              {rightIcon && onRightPress && (
                <RightButton onPress={onRightPress} accessibilityLabel="Right action" role="button">
                  <Ionicons name={rightIcon} size={Width.iconHeader} color={Colors.white} />
                </RightButton>
              )}
            </BackButtonRow>

            {title && (
              <TitleContainer>
                <Title role="header">{title}</Title>

                {subtitle && <Subtitle>{subtitle}</Subtitle>}
              </TitleContainer>
            )}
          </BackContainer>
        )}

        {/* PAGE DETAILS HEADER */}
        {variant === 'pageDetails' && (
          <DetailsRow>
            <BackButtonDetails
              onPress={() => navigateToPreviousRoute()}
              accessibilityLabel="Go back"
              role="button"
            >
              <Ionicons name="arrow-back" size={Width.iconHeader} color={Colors.white} />
            </BackButtonDetails>
          </DetailsRow>
        )}

        {showBottomDivider && <Divider />}
      </HeaderContent>
    </HeaderFixedContainer>
  );
};

export default Header;

/* ---------------- styled components ---------------- */

const HeaderFixedContainer = styled.View`
  position: absolute;
  top: 10;
  left: ${Spacing.margemLateral}px;
  right: ${Spacing.margemLateral}px;
  z-index: 1000;
  background-color: transparent;
`;

const SafeArea = styled.View<{ height: number }>`
  height: ${({ height }: { height: number }) => height}px;
`;

const HeaderContent = styled.View`
  justify-content: center;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BackContainer = styled.View<{ hasText: boolean }>`
  flex-direction: column;
  margin-top: ${Spacing.sm}px;
`;

const BackButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.Pressable`
  z-index: 99;
  padding-bottom: ${Spacing.sm}px;
  border-radius: ${BorderRadius.round}px;
`;

const RightButton = styled.Pressable`
  z-index: 99;
  padding-bottom: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
`;

const BackButtonDetails = styled.Pressable`
  z-index: 99;
  background-color: ${Colors.background};
  padding: ${Spacing.sm}px;
  border-radius: ${BorderRadius.round}px;
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

/* PAGE DETAILS */

const DetailsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spacing.md}px;
`;

const DetailsTextContainer = styled.View`
  flex: 1;
`;

const DetailsTitle = styled.Text`
  color: ${Colors.white};
  ${TextStyles.titulo.h3};
`;

const DetailsSubtitle = styled.Text`
  color: ${Colors.inactive};
  margin-top: ${Spacing.xs}px;
  ${TextStyles.corpo.corpoTexto};
`;

const Title = styled.Text`
  color: ${Colors.white};
  ${TextStyles.titulo.h};
  include-font-padding: false;
`;

const Subtitle = styled.Text`
  color: ${Colors.inactive};
  margin-top: ${Spacing.xs}px;
  ${TextStyles.corpo.corpoTexto};
`;

const Divider = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
`;
