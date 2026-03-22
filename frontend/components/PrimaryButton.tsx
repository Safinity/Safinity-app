import styled from 'styled-components/native';

const Button = styled.TouchableOpacity<{ disabled?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ disabled, theme }) =>
    disabled ? theme.colors.palette.primary.dark60 : theme.colors.palette.primary.normal};
  opacity: ${({ disabled }) => (disabled ? 0.8 : 1)};
  width: 100%;
  include-font-padding: false;
  padding-vertical: 0px;
`;

const Label = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
`;

export default function PrimaryButton({ title, onPress, disabled, accessibilityLabel }: any) {
  return (
    <Button 
    disabled={disabled}
    onPress={onPress}
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || title}>
      <Label>{title}</Label>
    </Button>
  );
}
