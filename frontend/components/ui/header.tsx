import React from 'react';
import { Platform, StatusBar } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';
import logo from '../../assets/logos/logo-header.png';

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
  const theme = useTheme();
  const headerHeight = (Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24) + 60;

  return (
    <>
      <HeaderFixedContainer height={headerHeight}>
        <SafeArea />
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
                  <Ionicons name="notifications-outline" size={22} color={Colors.white} />
                </IconButton>
                <IconButton onPress={onProfilePress}>
                  <Ionicons name="person-circle" size={28} color={Colors.white} />
                </IconButton>
              </IconRow>
            )}
          </HeaderRow>

          {showBottomDivider && <Divider />}
        </HeaderContent>
      </HeaderFixedContainer>

      <HeaderSpacer height={headerHeight} />
    </>
  );
};

const HeaderFixedContainer = styled.View<{ height: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: ${({ height }) => height}px;
`;

const HeaderSpacer = styled.View<{ height: number }>`
  height: ${({ height }) => height}px;
  width: 100%;
`;

const SafeArea = styled.View`
  height: ${Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24}px;
  background-color: transparent;
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
  width: 120px;
  height: 22px;
`;

const LogoText = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${Colors.white};
`;

const Divider = styled.View`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const IconRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.lg}px;
  align-items: center;
`;

const IconButton = styled.Pressable`
  padding: ${Spacing.xs}px;
`;

export default Header;
