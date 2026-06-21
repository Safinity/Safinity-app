import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

type PingFriendProps = {
  onPress?: () => void;
  disabled?: boolean;
} & React.ComponentProps<typeof styled.TouchableOpacity>;

const Button = styled.TouchableOpacity<{ disabled?: boolean }>`
  /* Forçado para 44px para ficar exatamente do mesmo tamanho dos outros botões */
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  /* Mantém o fundo branco puro para não inverter no Light Mode */
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.palette.primary.light60 : '#FFFFFF'};

  /* Borda fina e subtil com o roxo do sistema para destacar o botão */
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.palette.primary.light80};
`;

export default function PingFriend({ onPress, disabled = false, ...rest }: PingFriendProps) {
  return (
    <Button disabled={disabled} onPress={onPress} {...rest} activeOpacity={0.85}>
      <Ionicons
        name="radio-outline"
        size={theme.width.iconHeader}
        /* Cor fixa do ícone em roxo vibrante para manter o contraste perfeito */
        color="#9242CC"
      />
    </Button>
  );
}
