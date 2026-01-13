import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

const Button = styled.TouchableOpacity`
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme }) => theme.colors.palette.primary.normal};
  justify-content: center;
  align-items: center;
`;

export default function FindFriendButton({ onPress, disabled }: any) {
  return (
    <Button disabled={disabled} onPress={onPress}>
      <Ionicons name="location-outline" size={24} color="white" />
    </Button>
  );
}
