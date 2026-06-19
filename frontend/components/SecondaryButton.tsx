import { Spacing, BorderRadius } from '../constants/theme';
import styled from 'styled-components/native';

const Button = styled.TouchableOpacity`
  padding: ${Spacing.md}px;
  border-radius: ${BorderRadius.medium}px;
  background-color: ${({ theme }) => theme.colors.surfaceSoft};
  width: 100%;
  include-font-padding: false;
`;

const Label = styled.Text`
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

export default function SecondaryButton({ title, onPress }: any) {
  return (
    <Button onPress={onPress}>
      <Label>{title}</Label>
    </Button>
  );
}
