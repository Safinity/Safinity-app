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
  editable = true,
  accessibilityHint,
}: any) {
  const [show, setShow] = useState(false);

  return (
    <Wrapper style={style}>
      <Label>
        {/* Se a label tiver *, remove-o do texto principal. Se não, mostra a label normal */}
        {label.includes('*') ? label.replace('*', '').trim() : label}

        {/* Se houver um *, renderiza o componente vermelho */}
        {label.includes('*') && <RequiredAsterisk aria-hidden="true"> *</RequiredAsterisk>}
      </Label>

      <Box $editable={editable}>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8a90a5"
          secureTextEntry={password && !show}
          keyboardType={keyboardType}
          autoCapitalize="none"
          editable={editable}
          accessibilityLabel={`${label}`}
          accessibilityHint={accessibilityHint}
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
  color: ${({ theme }) => theme.colors.inactive};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const Box = styled.View<{ $editable?: boolean }>`
  background-color: ${({ $editable, theme }) =>
    $editable ? theme.colors.grayNavbar : theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  opacity: ${({ $editable }) => ($editable ? 1 : 0.86)};
`;

const Input = styled.TextInput`
  flex: 1;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.corpo.corpoTexto};
  include-font-padding: false;
  padding-vertical: 0px;
`;

const RequiredAsterisk = styled.Text`
  color: #ff5252;
  font-weight: bold;
`;
