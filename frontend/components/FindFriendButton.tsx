import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

type FindFriendButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
};

const Button = styled.TouchableOpacity<{ disabled?: boolean }>`
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.palette.primary.light60 : theme.colors.palette.primary.normal};
  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export default function FindFriendButton({ onPress, disabled = false }: FindFriendButtonProps) {
  const theme = useTheme();

  return (
    <Button disabled={disabled} onPress={onPress} activeOpacity={0.85}>
      <Ionicons
        name="location-outline"
        size={theme.width.iconHeader}
        color={disabled ? theme.colors.palette.primary.dark40 : theme.colors.white}
      />
    </Button>
  );
}
