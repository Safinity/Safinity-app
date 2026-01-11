import { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import users from '@/data/users.json';
import PrimaryButton from '@/components/PrimaryButton';

const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Container = styled.View`
  padding: ${({ theme }) => theme.spacing.xl}px;
  flex: 1;
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled.Text`
  color: white;
  margin-bottom: 4px;
  ${({ theme }) => theme.text.titulo.h1};
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  margin-bottom: 32px;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const InputGroup = styled.View`
  margin-bottom: 18px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  margin-bottom: 6px;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const InputBox = styled.View`
  background-color: #2a303f;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  padding: 14px;
  flex-direction: row;
  align-items: center;
`;

const Input = styled.TextInput`
  flex: 1;
  color: white;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  margin-top: 12px;
  text-align: center;
`;

const ForgotRow = styled.View`
  align-items: flex-end;
  margin-bottom: 32px;
`;

const LinkText = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  text-decoration: underline;
`;

const BottomRow = styled.View`
  margin-top: 24px;
  align-items: center;
`;

const SmallText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.textoPequeno};
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  function handleLogin() {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    // Login OK (mock)
    router.replace('/(tabs)');
  }

  return (
    <Screen>
      <Container>
        {/* Back */}
        <BackButton onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </BackButton>

        <Title>Log in</Title>
        <Subtitle>Welcome back!</Subtitle>

        {/* Email */}
        <InputGroup>
          <Label>Email</Label>
          <InputBox>
            <Input
              placeholder="Email"
              placeholderTextColor="#8a90a5"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Ionicons name="mail-outline" size={20} color="#cfd3e0" />
          </InputBox>
        </InputGroup>

        {/* Password */}
        <InputGroup>
          <Label>Password</Label>
          <InputBox>
            <Input
              placeholder="Password"
              placeholderTextColor="#8a90a5"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#cfd3e0"
              />
            </TouchableOpacity>
          </InputBox>
        </InputGroup>

        <ForgotRow>
          <SmallText>
            Forgot your password? <LinkText>Recover password</LinkText>
          </SmallText>
        </ForgotRow>

        {error ? <ErrorText>{error}</ErrorText> : null}

        <PrimaryButton title="Log in" onPress={handleLogin} />

        <BottomRow>
          <SmallText>
            Don’t have an account?{' '}
            <LinkText onPress={() => router.push('/register')}>Create Account</LinkText>
          </SmallText>
        </BottomRow>
      </Container>
    </Screen>
  );
}
