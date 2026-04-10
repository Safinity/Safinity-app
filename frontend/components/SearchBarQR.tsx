import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  onPressQR?: () => void;
  placeholder?: string;
  accessibilityLabel?: string; // <- novo prop opcional
}

export default function SearchBarQR({
  value,
  onChangeText,
  onSubmitEditing,
  onPressQR,
  placeholder = 'Find friends',
  accessibilityLabel = 'Search friends by name or username', // label padrão
}: Props) {
  return (
    <Wrapper>
      <Bar>
        <Ionicons
          name="search"
          size={24}
          color={Colors.white}
          accessibilityElementsHidden // ícone decorativo escondido do leitor de tela
          importantForAccessibility="no"
        />
        <Input
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={Colors.white}
          returnKeyType="search"
          accessibilityLabel={accessibilityLabel} // <- rótulo acessível
          accessible={true}
        />
      </Bar>

      <QRButton
        onPress={onPressQR}
        role="button"
        accessibilityLabel="Scan QR code to find friends"
      >
        <Ionicons
          name="qr-code-outline"
          size={34}
          color={Colors.white}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </QRButton>
    </Wrapper>
  );
}

const Wrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
`;

const Bar = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  height: 58px;
  background-color: ${Colors.grayNavbar};
  border-radius: ${BorderRadius.large}px;
  padding: 0 ${Spacing.md}px;
`;

const Input = styled.TextInput`
  flex: 1;
  color: ${Colors.white};
  font-size: 16px;
  margin-left: ${Spacing.sm}px;
`;

const QRButton = styled.TouchableOpacity`
  margin-left: 16px;
`;
