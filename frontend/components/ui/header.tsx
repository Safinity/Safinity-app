import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DeviceEventEmitter,
  Platform,
  StatusBar,
  type ImageSourcePropType,
} from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { useNotifications } from '@/context/NotificationsContext';
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedPayload,
} from '@/utils/profileEvents';
import { getMyProfile } from '@/utils/profile';
import { getUserImageSource } from '@/utils/userImages';
import { Colors, Spacing, Height, Width, BorderRadius, TextStyles } from '../../constants/theme';
import { navigateToPreviousRoute } from '../../utils/navigationHistory';

export type HeaderVariant = 'default' | 'back' | 'pageDetails';

interface HeaderProps {
  variant?: HeaderVariant;
  colorScheme?: 'dark' | 'light';
  showBottomDivider?: boolean;
  title?: string;
  subtitle?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  forceDarkLogo?: boolean;
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
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const [profileImageSource, setProfileImageSource] = useState<ImageSourcePropType | null>(null);

  getTokenRef.current = getToken;

  const loadProfileImage = useCallback(async () => {
    if (variant !== 'default') return;

    if (!isLoaded || !isSignedIn) {
      setProfileImageSource(null);
      return;
    }

    try {
      const token = await getTokenRef.current({ skipCache: true });
      const profile = await getMyProfile(token);

      setProfileImageSource(getUserImageSource(profile.image));
    } catch {
      setProfileImageSource(null);
    }
  }, [isLoaded, isSignedIn, variant]);

  useEffect(() => {
    void loadProfileImage();
  }, [loadProfileImage]);

  useFocusEffect(
    useCallback(() => {
      void loadProfileImage();
    }, [loadProfileImage]),
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      PROFILE_UPDATED_EVENT,
      (payload?: ProfileUpdatedPayload) => {
        if (payload && 'image' in payload) {
          setProfileImageSource(getUserImageSource(payload.image));
          return;
        }

        void loadProfileImage();
      },
    );

    return () => {
      subscription.remove();
    };
  }, [loadProfileImage]);

  const isDarkMode = theme.colors.mode === 'dark';
  const useDarkAppearance = isDarkMode || forceDarkLogo;

  const logoSource = useDarkAppearance
    ? require('../../assets/logos/logo-header.png')
    : require('../../assets/logos/logo-header-light.png');

  const iconColor = useDarkAppearance ? Colors.white : theme.colors.black;

  const hasText = Boolean(title || subtitle);

  return (
    <HeaderFixedContainer>
      <SafeArea height={statusBarHeight} />

      <HeaderContent>
        {variant === 'default' && (
          <HeaderRow>
            <LogoContainer>
              <LogoImage source={logoSource} resizeMode="contain" />
            </LogoContainer>

            <IconRow>
              <IconButton onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={Width.iconHeader} color={iconColor} />
                {unreadCount > 0 && (
                  <NotificationBadge>
                    <NotificationBadgeText>{unreadCount > 9 ? '9+' : unreadCount}</NotificationBadgeText>
                  </NotificationBadge>
                )}
              </IconButton>

              <IconButton onPress={() => router.push('/perfil/profile')}>
                {profileImageSource ? (
                  <ProfileAvatar source={profileImageSource} />
                ) : (
                  <Ionicons name="person-circle" size={Width.iconHeader} color={iconColor} />
                )}
              </IconButton>
            </IconRow>
          </HeaderRow>
        )}

        {variant === 'back' && (
          <BackContainer hasText={hasText}>
            <BackButtonRow>
              <BackButton onPress={() => navigateToPreviousRoute()}>
                <Ionicons name="arrow-back" size={Width.iconHeader} color={iconColor} />
              </BackButton>

              {rightIcon && onRightPress && (
                <RightButton onPress={onRightPress}>
                  <Ionicons name={rightIcon} size={Width.iconHeader} color={iconColor} />
                </RightButton>
              )}
            </BackButtonRow>

            {title && (
              <TitleContainer>
                <Title role="header" useDarkAppearance={useDarkAppearance}>
                  {title}
                </Title>
                {subtitle && (
                  <Subtitle useDarkAppearance={useDarkAppearance}>
                    {subtitle}
                  </Subtitle>
                )}
              </TitleContainer>
            )}
          </BackContainer>
        )}

        {variant === 'pageDetails' && (
          <DetailsRow>
            <BackButtonDetails onPress={() => navigateToPreviousRoute()}>
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

const HeaderFixedContainer = styled.View`
  position: absolute;
  top: 10;
  left: ${Spacing.margemLateral}px;
  right: ${Spacing.margemLateral}px;
  z-index: 1000;
  background-color: transparent;
`;

const SafeArea = styled.View<{ height: number }>`
  height: ${({ height }) => height}px;
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
  padding-bottom: ${Spacing.sm}px;
  border-radius: ${BorderRadius.round}px;
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

const ProfileAvatar = styled.Image`
  width: ${Width.iconHeader}px;
  height: ${Width.iconHeader}px;
  border-radius: ${Width.iconHeader / 2}px;
  background-color: ${({ theme }) => theme.colors.surfaceSoft};
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

const DetailsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spacing.md}px;
`;

const Title = styled.Text<{ useDarkAppearance?: boolean }>`
  color: ${({ useDarkAppearance }) => (useDarkAppearance ? Colors.white : '#000000')};
  ${TextStyles.titulo.h};
  include-font-padding: false;
`;

const Subtitle = styled.Text<{ useDarkAppearance?: boolean }>`
  color: ${({ useDarkAppearance }) => (useDarkAppearance ? Colors.inactive : '#666666')};
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