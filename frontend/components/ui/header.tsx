import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { useNotifications } from '@/context/NotificationsContext';
import { Colors, Spacing, Height, Width, BorderRadius, TextStyles } from '../../constants/theme';
import { navigateToPreviousRoute } from '../../utils/navigationHistory';

export type HeaderVariant = 'default' | 'back' | 'pageDetails';

interface HeaderProps {
  variant?: HeaderVariant;
  colorScheme?: 'dark' | 'light'; // Mantido por compatibilidade, mas a lógica agora segue o forceDarkLogo
  showBottomDivider?: boolean;
  title?: string;
  subtitle?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  forceDarkLogo?: boolean; // Controla se a página força o aspeto escuro (Logótipo escuro + Ícones brancos)
}

const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  colorScheme = 'dark',
  showBottomDivider = false,
  title,
  subtitle,
  rightIcon,
  onRightPress,
  forceDarkLogo = false,
}) => {
  const theme = useTheme();
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  const { unreadCount } = useNotifications();

  // REGRA DA MUDANÇA:
  // Determina se o cabeçalho deve usar a aparência escura (seja pelo sistema ou forçado por esta página)
  const isDarkMode = theme.colors.mode === 'dark';
  const useDarkAppearance = isDarkMode || forceDarkLogo;

  // 1. Lógica do Logótipo (Igual à anterior)
  const logoSource = useDarkAppearance
    ? require('../../assets/logos/logo-header.png')       // Imagem para fundo escuro
    : require('../../assets/logos/logo-header-light.png'); // Imagem para fundo claro

  // 2. Lógica dos Ícones baseada na mesma regra
  // Se for aparência escura, o ícone deve ser BRANCO. Se for aparência clara, o ícone deve ser PRETO.
  const iconColor = useDarkAppearance ? Colors.white : theme.colors.black;

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
                source={logoSource}
                resizeMode="contain"
              />
            </LogoContainer>

            <IconRow>
              <IconButton
                onPress={() => router.push('/notifications')}
                role="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons name="notifications-outline" size={Width.iconHeader} color={iconColor} // <-- Atualizado dinamicamente />
                {unreadCount > 0 && (
                  <NotificationBadge>
                    <NotificationBadgeText>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </NotificationBadgeText>
                  </NotificationBadge>
                )}
              </IconButton>

              <IconButton
                onPress={() => router.push('/perfil/profile')}
                role="button"
                accessibilityLabel="Profile"
              >
                <Ionicons 
                  name="person-circle" 
                  size={Width.iconHeader} 
                  color={iconColor} // <-- Atualizado dinamicamente
                />
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
                <Ionicons name="arrow-back" size={Width.iconHeader} color={iconColor} />
              </BackButton>

              {rightIcon && onRightPress && (
                <RightButton onPress={onRightPress} accessibilityLabel="Right action" role="button">
                  <Ionicons name={rightIcon} size={Width.iconHeader} color={iconColor} />
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
              <Ionicons name="arrow-back" size={Width.iconHeader} color={iconColor} />
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
  background-color: ${({ theme }) => theme.colors.background};
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

const IconButton = styled.Pressable`
  position: relative;
`;

const NotificationBadge = styled.View`
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  padding-horizontal: 4px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -4px;
  right: -5px;
`;

const NotificationBadgeText = styled.Text`
  color: ${Colors.white};
  font-size: 9px;
  font-family: ${TextStyles.label.fontFamily};
`;

/* PAGE DETAILS */

const DetailsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spacing.md}px;
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