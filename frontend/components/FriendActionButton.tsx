import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

const Button = styled.TouchableOpacity<{ variant: 'add' | 'remove' }>`
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;

  background-color: ${({ variant, theme }) =>
    variant === 'add' ? theme.colors.palette.primary.normal : theme.colors.white};

  justify-content: center;
  align-items: center;
`;

export default function FriendActionButton({
  onPress,
  disabled,
  variant = 'remove',
}: {
  onPress: () => void;
  disabled?: boolean;
  variant?: 'add' | 'remove';
}) {
  const iconName = variant === 'add' ? 'person-add-outline' : 'person-remove-outline';

  const iconColor = variant === 'add' ? theme.colors.white : theme.colors.palette.primary.normal;

  return (
    <Button variant={variant} disabled={disabled} onPress={onPress}>
      <Ionicons name={iconName} size={theme.width.iconHeader} color={iconColor} />
    </Button>
  );
}
