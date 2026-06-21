import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

type FindFriendButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
} & React.ComponentProps<typeof styled.TouchableOpacity>;

const Button = styled.TouchableOpacity<{ disabled?: boolean }>`
  /* Tamanho ideal para alinhar com o botão de vibrar/ping */
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  
  /* Usa o roxo dinâmico do sistema (primary) ativo em ambos os modos */
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.palette.primary.light60 : theme.colors.primary};
    
  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export default function FindFriendButton({
  onPress,
  disabled = false,
  ...rest
}: FindFriendButtonProps) {
  const currentTheme = useTheme();

  return (
    <Button disabled={disabled} onPress={onPress} {...rest} activeOpacity={0.85}>
      <Ionicons
        name="location-outline"
        size={currentTheme.width.iconHeader}
        /* Ícone sempre branco puro para dar contraste perfeito sobre o fundo roxo */
        color={disabled ? currentTheme.colors.palette.primary.dark40 : '#FFFFFF'}
      />
    </Button>
  );
}