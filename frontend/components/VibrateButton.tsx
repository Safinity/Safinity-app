import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

const Button = styled.TouchableOpacity`
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme }) => theme.colors.white};
  justify-content: center;
  align-items: center;
`;

export default function PingFriend({ onPress, disabled }: any) {
  return (
    <Button disabled={disabled} onPress={onPress}>
      <Ionicons name="radio-outline" size={24} color={theme.colors.palette.primary.normal} />
    </Button>
  );
}
