import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';

const Button = styled(TouchableOpacity)`
  align-items: center;
`;

const Label = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.white};
  text-decoration-line: underline;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export default function TertiaryButton({
  title,
  onPress,
  accessibilityRole,
  accessibilityLabel,
}: any) {
  return (
    <Button
      onPress={onPress}
      accessibilityRole={accessibilityRole ?? 'button '}
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <Label>{title}</Label>
    </Button>
  );
}
