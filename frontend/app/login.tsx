import { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import users from '@/data/users.json';
import PrimaryButton from '@/components/PrimaryButton';

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

    router.replace('/(tabs)');
  }

  return (
    <Container>
      <BackButton
        onPress={() => router.back()}
        accessibilityLabel="Return to the previous page"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={26} color="white" />
      </BackButton>

      <Title accessibilityRole="header">Log in</Title>
      <Subtitle>Welcome back!</Subtitle>

      <InputGroup>
        <Label>Email</Label>
        <InputBox>
          <Input
            accessibilityLabel="Email input field"
            placeholder="Email"
            placeholderTextColor="#8a90a5"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Ionicons
            name="mail-outline"
            size={20}
            color="#cfd3e0"
            importantForAccessibility="no-hide-descendants" // Para Android
            accessibilityElementsHidden={true} // Para iOS
          />
        </InputBox>
      </InputGroup>

      <InputGroup accessible={true} accessibilityLabel="Password">
        <Label>Password</Label>

        <InputBox>
          <Input
            placeholder="Password"
            placeholderTextColor="#8a90a5"
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => setShowPass(!showPass)}
            accessibilityRole="button"
            accessibilityLabel={showPass ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#cfd3e0"
            />
          </TouchableOpacity>
        </InputBox>
      </InputGroup>

      <RowWithLink>
        <SmallText>Forgot your password?</SmallText>
        <LinkArea accessibilityRole="link">
          <LinkText>Recover password</LinkText>
        </LinkArea>
      </RowWithLink>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <PrimaryButton title="Log in" onPress={handleLogin} />

      <RowWithLink>
        <SmallText>Don’t have an account?</SmallText>
        <LinkArea accessibilityRole="link" onPress={() => router.push('/register')}>
          <LinkText>Create Account</LinkText>
        </LinkArea>
      </RowWithLink>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const LinkArea = styled.TouchableOpacity`
  margin-left: ${({ theme }) => theme.spacing.xs}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  ${({ theme }) => theme.text.titulo.h1};
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const InputGroup = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const InputBox = styled.View`
  background-color: ${({ theme }) => theme.colors.palette.neutral.neutral20};
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
`;

const Input = styled.TextInput`
  flex: 1;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.corpo.corpoTexto};

  include-font-padding: false;
  padding-vertical: 0px;
  line-height: ${({ theme }) => theme.text.corpo.corpoTexto.lineHeight}px;
`;

/* =======================
   Auxiliares
======================= */

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.md}px;
  text-align: center;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const RowWithLink = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const LinkText = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  ${({ theme }) => theme.text.textoPequeno};
`;

const SmallText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.textoPequeno};
`;
