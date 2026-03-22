import { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';


export default function InputField({
  label,
  icon,
  password,
  keyboardType,
  placeholder,
  value,
  onChangeText,
  style,
}: any) {
  const [show, setShow] = useState(false);

  return (
    <Wrapper style={style}>
      <Label>{label}</Label>

      <Box>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8a90a5"
          secureTextEntry={password && !show}
          keyboardType={keyboardType}
          autoCapitalize="none"
          accessibilityLabel={`${label}`}
        />

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

// ---------------------------------------------------------------- Styled Components ----------------------------------------------------------------

const Wrapper = styled.View`
  margin-bottom: 16px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.white};
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