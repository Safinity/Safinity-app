import { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const Wrapper = styled.View`
  margin-bottom: 16px;
`;

const Label = styled.Text`
  color: #cfd3e0;
  font-size: 14px;
  margin-bottom: 6px;
`;

const Box = styled.View`
  background-color: #2a303f;
  border-radius: 10px;
  padding: 12px 14px;
  flex-direction: row;
  align-items: center;
`;

const Input = styled.TextInput`
  flex: 1;
  color: white;
`;

export default function InputField({ label, icon, password, keyboardType, placeholder }: any) {
  const [show, setShow] = useState(false);

  return (
    <Wrapper>
      <Label>{label}</Label>

      <Box>
        <Input
          placeholder={placeholder}
          placeholderTextColor="#8a90a5"
          secureTextEntry={password && !show}
          keyboardType={keyboardType}
        />

        {/* right icon */}
        {password ? (
          <TouchableOpacity onPress={() => setShow(!show)}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color="#cfd3e0" />
          </TouchableOpacity>
        ) : icon ? (
          <Ionicons name={icon} size={20} color="#cfd3e0" />
        ) : null}
      </Box>
    </Wrapper>
  );
}
