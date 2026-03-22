import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

type FriendActionButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  variant?: 'add' | 'remove';
} & React.ComponentProps<typeof styled.TouchableOpacity>; // aceita props extras

const Button = styled.TouchableOpacity<{ variant: 'add' | 'remove'; disabled?: boolean }>`
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ variant, theme }) =>
    variant === 'add' ? theme.colors.palette.primary.normal : theme.colors.white};
  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export default function FriendActionButton({
  onPress,
  disabled = false,
  variant = 'remove',
  ...rest
}: FriendActionButtonProps) {
  const iconName = variant === 'add' ? 'person-add-outline' : 'person-remove-outline';
  const iconColor = variant === 'add' ? theme.colors.white : theme.colors.palette.primary.normal;

  return (
    <Button variant={variant} disabled={disabled} onPress={onPress} {...rest} activeOpacity={0.85}>
      <Ionicons name={iconName} size={theme.width.iconHeader} color={iconColor} />
    </Button>
  );
}