import { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import users from '@/data/users.json';
import PrimaryButton from '@/components/PrimaryButton';
import Head from 'expo-router/head';

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
      <Head>
        <title>Log In | Safinity</title>
      </Head>
      <Stack.Screen options={{ title: 'Log In | Safinity', headerShown: false }} />

      <HeadingArea accessibilityRole="header">
        <BackButton
          onPress={() => router.back()}
          accessibilityLabel="Return to the previous page"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={26} color="white" />
        </BackButton>
        <Title accessibilityHeadingLevel={1}>Log In</Title>
        <Subtitle accessibilityHeadingLevel={2}>Welcome back!</Subtitle>
      </HeadingArea>

      <MainArea accessibilityRole="main">
        <InputGroup>
          <Label>
            Email <RequiredAsterisk>*</RequiredAsterisk>
          </Label>
          <InputBox>
            <Input
              accessibilityLabel="Email input field"
              accessibilityState={{ required: true }}
              returnKeyType="next"
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

        <InputGroup>
          <Label>
            Password <RequiredAsterisk>*</RequiredAsterisk>
          </Label>

          <InputBox>
            <Input
              accessibilityLabel="Password input field"
              accessibilityState={{ required: true }}
              returnKeyType="done"


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

        {error ? (
          <ErrorArea
            accessible={true}
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
            accessibilityLabel={`Error: ${error}`}
          >
            <Ionicons name="alert-circle" size={18} color="#ff5252" style={{ marginRight: 8 }} />
            <ErrorText>{error}</ErrorText>
          </ErrorArea>
        ) : null}

        <PrimaryButton
          accessibilityLabel="Log In"
          title="Log In"
          disabled={email === '' || password === ''}
          onPress={handleLogin}
        />

        <RowWithLink>
          <SmallText>Don`t have an account?</SmallText>
          <LinkArea accessibilityRole="link" onPress={() => router.push('/register')}>
            <LinkText>Create Account</LinkText>
          </LinkArea>
        </RowWithLink>
      </MainArea>
    </Container>
  );
}

// ------------------------------------------------------Styled Components------------------------------------------------------

const Container = styled.View`
  flex: 1;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const HeadingArea = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  ${({ theme }) => theme.text.titulo.h1};
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const MainArea = styled.View`
  flex: 1;
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
  background-color: ${({ theme }) => theme.colors.grayNavbar};
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

const RowWithLink = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SmallText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.textoPequeno};
`;

const LinkArea = styled.TouchableOpacity`
  margin-left: ${({ theme }) => theme.spacing.xs}px;
`;

const LinkText = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light80};
  ${({ theme }) => theme.text.textoPequeno};
`;

const ErrorArea = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  font-weight: bold;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;

const RequiredAsterisk = styled.Text`
  color: #ff5252;
  font-weight: bold;
`;
