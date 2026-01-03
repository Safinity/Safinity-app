import styled from 'styled-components/native';

const Label = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.white};
  text-decoration-line: underline;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export default function TertiaryButton({ title, onPress }: any) {
  return <Label onPress={onPress}>{title}</Label>;
}
