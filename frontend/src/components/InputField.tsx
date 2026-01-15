import { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div``;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.palette.neutral.neutral80};
  font-family: ${({ theme }) => theme.text.label.fontFamily};
  font-size: ${({ theme }) => theme.text.label.fontSize}px;
  line-height: ${({ theme }) => theme.text.label.lineHeight}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  display: block;
`;

const Box = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  padding: ${({ theme }) => `${theme.spacing.sm}px ${theme.spacing.md}px`};
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;

  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }) => theme.text.corpo.corpoTexto.lineHeight}px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.palette.neutral.neutral60};
  }
`;

interface InputFieldProps {
  label: string;
  password?: boolean;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({
  label,
  password,
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  const [show] = useState(false);

  return (
    <Wrapper>
      <Label>{label}</Label>
      <Box>
        <Input
          type={password ? (show ? 'text' : 'password') : 'text'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </Box>
    </Wrapper>
  );
}
