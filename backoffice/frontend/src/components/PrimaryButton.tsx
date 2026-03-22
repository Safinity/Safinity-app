import styled from 'styled-components';
import React from 'react';

const Button = styled.button`
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme }) => theme.colors.palette.primary.normal};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.palette.primary.dark40};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function PrimaryButton({ children, onClick }: PrimaryButtonProps) {
  return <Button onClick={onClick}>{children}</Button>;
}
