import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { Colors, Spacing } from '../../constants/theme';

const Toggle: React.FC<ToggleProps> = ({
  isEnabled,
  onToggle,
  label,
  description,
  disabled = false,
}) => {
  const knobPosition = useRef(new Animated.Value(isEnabled ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(knobPosition, {
      toValue: isEnabled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isEnabled]);

  const knobLeft = knobPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <ToggleContainer>
      <ToggleContent>
        <ToggleLabelContainer>
          <ToggleLabel disabled={disabled}>{label}</ToggleLabel>
          {description && <ToggleDescription disabled={disabled}>{description}</ToggleDescription>}
        </ToggleLabelContainer>

        <ToggleSwitch
          onPress={disabled ? undefined : onToggle}
          active={isEnabled}
          disabled={disabled}
          role="switch"
          accessibilityLabel={label}
          accessibilityState={{
            checked: isEnabled,
            disabled: disabled,
          }}
        >
          <AnimatedKnob style={{ left: knobLeft }} active={isEnabled} disabled={disabled} />
        </ToggleSwitch>
      </ToggleContent>
    </ToggleContainer>
  );
};

export default Toggle;

const ToggleContainer = styled.View`
  padding: ${Spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) =>
    theme.colors.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
`;

const ToggleContent = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ToggleLabelContainer = styled.View`
  flex: 1;
  margin-right: ${Spacing.md}px;
`;

const ToggleLabel = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: 'PlusJakartaSans_500Medium';
  font-size: 16px;
  margin-bottom: ${Spacing.xs}px;
`;

const ToggleDescription = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: 'PlusJakartaSans_300Light';
  font-size: 14px;
  line-height: 18px;
`;

const ToggleSwitch = styled.Pressable<{ active: boolean }>`
  width: 51px;
  height: 31px;
  border-radius: 15.5px;
  background-color: ${({ active, theme }) => {
    const isDark = theme.colors.mode === 'dark';
    if (isDark) {
      return active ? theme.colors.palette.primary.light60 : theme.colors.grayNavbar;
    }
    return active ? theme.colors.palette.primary.light80 : theme.colors.palette.neutral.neutral80;
  }};
  justify-content: center;
  padding: 2px;
`;

const AnimatedKnob = Animated.createAnimatedComponent(styled.View<{
  active: boolean;
  disabled?: boolean;
}>`
  width: 27px;
  height: 27px;
  border-radius: 13.5px;
  background-color: ${({ active, theme }) => {
    const isDark = theme.colors.mode === 'dark';

    if (isDark) {
      return active ? theme.colors.palette.primary.dark50 : theme.colors.background;
    }
    return active ? theme.colors.primary : theme.colors.inactive;
  }};
  position: absolute;
`);
