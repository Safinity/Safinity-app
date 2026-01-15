import styled from 'styled-components';

const Button = styled.button`
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.palette.primary.normal};
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.palette.primary.light60};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function SecondaryButton({ children, onClick }: any) {
  return <Button onClick={onClick}>{children}</Button>;
}
