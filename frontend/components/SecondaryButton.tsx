import styled from 'styled-components/native';

const Button = styled.TouchableOpacity`
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme }) => theme.colors.palette.primary.light80};
`;

const Label = styled.Text`
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.palette.primary.dark20};
`;

export default function SecondaryButton({ title, onPress }: any) {
  return (
    <Button onPress={onPress}>
      <Label>{title}</Label>
    </Button>
  );
}
