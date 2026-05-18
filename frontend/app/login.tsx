import { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useAuth, useClerk, useSignIn } from '@clerk/expo';

import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import Header from '@/components/ui/header';

export default function Login() {
  const { isLoaded, isSignedIn } = useAuth();
  const { setActive } = useClerk();
  const { signIn } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn]);

  async function handleLogin() {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const { error: clerkError } = await signIn.password({
      emailAddress: email,
      password,
    });

    if (clerkError) {
      setError(clerkError.message || 'Invalid email or password');
      return;
    }

    if (signIn.createdSessionId) {
      await setActive({ session: signIn.createdSessionId });
      router.replace('/(tabs)');
      return;
    }

    setError('Unable to sign in. Please try again.');
  }

  return (
    <Container>
      <Head>
        <title>Log In | Safinity</title>
      </Head>

      <Stack.Screen options={{ headerShown: false }} />

      <Header variant="back" title="Log In" subtitle="Welcome back!" />

      <MainArea role="main">
        <InputGroup>
          <InputField
            label="Email *"
            placeholder="Email"
            icon="mail-outline"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            accessibilityState={{ required: true }}
          />

          <InputField
            label="Password *"
            placeholder="Password"
            password
            value={password}
            onChangeText={setPassword}
            accessibilityState={{ required: true }}
          />
        </InputGroup>

        <RowWithLink>
          <SmallText>Forgot your password?</SmallText>

          <LinkArea role="link">
            <LinkText>Recover password</LinkText>
          </LinkArea>
        </RowWithLink>

        {error ? (
          <ErrorArea
            accessible={true}
            accessibilityLiveRegion="assertive"
            role="alert"
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

          <LinkArea role="link" onPress={() => router.push('/register')}>
            <LinkText>Create Account</LinkText>
          </LinkArea>
        </RowWithLink>
      </MainArea>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  padding-top: ${({ theme }) => theme.spacing.xxxl}px;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainArea = styled.View`
  flex: 1;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const InputGroup = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
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
