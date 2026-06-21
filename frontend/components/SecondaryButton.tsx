import styled from 'styled-components/native';
import { Spacing, BorderRadius } from '../constants/theme';

const Button = styled.TouchableOpacity`
  padding: ${Spacing.md}px;
  border-radius: ${BorderRadius.medium}px;
  /* Fundo muito claro/roxo suave como no figma */
  background-color: ${({ theme }) => theme.colors.palette.primary.light90 || '#F5F0FF'};
  width: 100%;
  align-items: center;
`;

const Label = styled.Text`
  /* Cor do texto roxa como no figma */
  color: ${({ theme }) => theme.colors.primary || '#800080'};
  font-weight: 600;
  font-size: 16px;
`;

export default function SecondaryButton({ title, onPress, accessibilityLabel }: any) {
  return (
    <Button
      onPress={onPress}
      accessible={true}
      role="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      <Label>{title}</Label>
    </Button>
  );
}
