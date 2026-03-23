import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

type PingFriendProps = {
  onPress?: () => void;
  disabled?: boolean;
} & React.ComponentProps<typeof styled.TouchableOpacity>; // <- aceita props extras como acessibilidade

const Button = styled.TouchableOpacity<{ disabled?: boolean }>`
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.palette.primary.light60 : theme.colors.white};
  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export default function PingFriend({ onPress, disabled = false, ...rest }: PingFriendProps) {
  return (
    <Button disabled={disabled} onPress={onPress} {...rest} activeOpacity={0.85}>
      <Ionicons
        name="radio-outline"
        size={theme.width.iconHeader}
        color={theme.colors.palette.primary.normal}
      />
    </Button>
  );
}
