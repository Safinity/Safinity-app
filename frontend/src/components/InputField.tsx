import { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
`;

const Label = styled.label`
  color: #cfd3e0;
  font-size: 14px;
  margin-bottom: 6px;
  display: block;
`;

const Box = styled.div`
  background-color: #2a303f;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Input = styled.input<{ type?: string }>`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  outline: none;

  &::placeholder {
    color: #8a90a5;
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
  const [show, setShow] = useState(false);

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
