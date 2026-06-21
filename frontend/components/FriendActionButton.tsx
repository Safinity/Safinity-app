import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

type FriendActionButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  variant?: 'add' | 'remove' | 'pending';
} & React.ComponentProps<typeof styled.TouchableOpacity>;

const Button = styled.TouchableOpacity<{
  variant: 'add' | 'remove' | 'pending';
  disabled?: boolean;
}>`
  /* Forçado para 44px para bater certo com todos os outros botões da lista */
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;

  /* Garante que o 'add', 'pending' e 'remove' usam sempre o Roxo Light (light90) fixo */
  background-color: ${({ theme }) => theme.colors.palette.primary.light90};

  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.palette.primary.light80};
`;

export default function FriendActionButton({
  onPress,
  disabled = false,
  variant = 'remove',
  ...rest
}: FriendActionButtonProps) {
  const iconName =
    variant === 'add'
      ? 'person-add-outline'
      : variant === 'pending'
        ? 'hourglass-outline'
        : 'person-remove-outline';

  /* Como o fundo agora é sempre roxo light, o ícone de adicionar também deve ser roxo escuro para dar contraste */
  const iconColor = '#9242CC';

  return (
    <Button variant={variant} disabled={disabled} onPress={onPress} {...rest} activeOpacity={0.85}>
      <Ionicons name={iconName} size={theme.width.iconHeader} color={iconColor} />
    </Button>
  );
}
