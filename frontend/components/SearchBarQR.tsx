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
}

export default function SearchBarQR({
  value,
  onChangeText,
  onSubmitEditing,
  onPressQR,
  placeholder = 'Find friends',
}: Props) {
  return (
    <Wrapper>
      <Bar>
        <Ionicons name="search" size={24} color={Colors.inactive} />
        <Input
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={Colors.inactive}
          returnKeyType="search"
        />
      </Bar>

      <QRButton onPress={onPressQR}>
        <Ionicons name="qr-code-outline" size={34} color={Colors.white} />
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
