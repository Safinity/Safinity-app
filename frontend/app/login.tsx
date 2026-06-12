import { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useAuth, useSignIn } from '@clerk/expo';

import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import Header from '@/components/ui/header';

export default function Login() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, setActive } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingSignIn, setPendingSignIn] = useState<any>(null);
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<
    'email_code' | 'phone_code' | 'totp' | 'backup_code' | null
  >(null);
  const [secondFactorHint, setSecondFactorHint] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn]);

  async function activateSessionIfAvailable(signInAttempt: any) {
    const createdSessionId =
      signInAttempt?.createdSessionId ??
      pendingSignIn?.createdSessionId ??
      signIn?.createdSessionId;

    if (!createdSessionId || !setActive) {
      return false;
    }

    await setActive({ session: createdSessionId });
    router.replace('/(tabs)');
    return true;
  }

  function getSignInStatusMessage(signInAttempt: any) {
    const status = signInAttempt?.status ?? pendingSignIn?.status ?? signIn?.status;
    const firstFactorStatus =
      signInAttempt?.firstFactorVerification?.status ??
      pendingSignIn?.firstFactorVerification?.status ??
      signIn?.firstFactorVerification?.status;
    const secondFactorStatus =
      signInAttempt?.secondFactorVerification?.status ??
      pendingSignIn?.secondFactorVerification?.status ??
      signIn?.secondFactorVerification?.status;

    return [
      status ? `status: ${status}` : null,
      firstFactorStatus ? `first factor: ${firstFactorStatus}` : null,
      secondFactorStatus ? `second factor: ${secondFactorStatus}` : null,
    ]
      .filter(Boolean)
      .join(', ');
  }

  async function continueSignIn(signInAttempt: any, depth = 0) {
    if (await activateSessionIfAvailable(signInAttempt)) {
      return true;
    }

    const firstFactorVerified = signInAttempt.firstFactorVerification?.status === 'verified';
    const inferredStatus =
      firstFactorVerified && signInAttempt.supportedSecondFactors?.length
        ? 'needs_second_factor'
        : signInAttempt.status;

    if (inferredStatus === 'needs_first_factor' && !firstFactorVerified) {
      const firstFactorAttempt = await signInAttempt.attemptFirstFactor({
        strategy: 'password',
        password,
      });

      return continueSignIn(firstFactorAttempt, depth + 1);
    }

    if (inferredStatus === 'needs_second_factor') {
      const factors = signInAttempt.supportedSecondFactors ?? [];
      const factor =
        factors.find((item: any) => item.strategy === 'email_code') ??
        factors.find((item: any) => item.strategy === 'phone_code') ??
        factors.find((item: any) => item.strategy === 'totp') ??
        factors.find((item: any) => item.strategy === 'backup_code');

      if (!factor) {
        setError('This account requires an unsupported second factor.');
        return true;
      }

      if (factor.strategy === 'email_code') {
        const prepared = await signInAttempt.prepareSecondFactor({
          strategy: 'email_code',
          emailAddressId: factor.emailAddressId,
        });
        setPendingSignIn(prepared);
        setSecondFactorStrategy('email_code');
        setSecondFactorHint(`Enter the code sent to ${factor.safeIdentifier || 'your email'}`);
        return true;
      }

      if (factor.strategy === 'phone_code') {
        const prepared = await signInAttempt.prepareSecondFactor({
          strategy: 'phone_code',
          phoneNumberId: factor.phoneNumberId,
        });
        setPendingSignIn(prepared);
        setSecondFactorStrategy('phone_code');
        setSecondFactorHint(`Enter the code sent to ${factor.safeIdentifier || 'your phone'}`);
        return true;
      }

      setPendingSignIn(signInAttempt);
      setSecondFactorStrategy(factor.strategy);
      setSecondFactorHint(
        factor.strategy === 'totp'
          ? 'Enter the code from your authenticator app'
          : 'Enter one of your backup codes',
      );
      return true;
    }

    if (firstFactorVerified && depth < 2 && typeof signInAttempt.reload === 'function') {
      const reloadedSignIn = await signInAttempt.reload();
      return continueSignIn(reloadedSignIn, depth + 1);
    }

    return false;
  }

  async function handleLogin() {
    setError('');
    setVerificationCode('');
    setPendingSignIn(null);
    setSecondFactorStrategy(null);
    setSecondFactorHint('');

    if (!isLoaded || !signIn) {
      setError('Authentication is still loading. Please try again.');
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: email.trim(),
        password,
      } as any);

      if (await continueSignIn(signInAttempt)) {
        return;
      }

      const statusMessage = getSignInStatusMessage(signInAttempt);
      setError(
        statusMessage.includes('first factor: verified')
          ? `Password verified, but Clerk did not return a session. ${statusMessage}`
          : `Unable to complete sign in. Current ${statusMessage || 'status: unknown'}`,
      );
    } catch (error: any) {
      setError(error.errors?.[0]?.message || error.message || 'Invalid email or password');
    }
  }

  async function handleVerifySecondFactor() {
    setError('');

    if (!pendingSignIn || !secondFactorStrategy) {
      setError('Please sign in again.');
      return;
    }

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      const signInAttempt = await pendingSignIn.attemptSecondFactor({
        strategy: secondFactorStrategy,
        code: verificationCode.trim(),
      });

      if (await activateSessionIfAvailable(signInAttempt)) {
        return;
      }

      setError(
        `Unable to complete sign in. Current ${getSignInStatusMessage(signInAttempt) || 'status: unknown'}`,
      );
    } catch (error: any) {
      setError(error.errors?.[0]?.message || error.message || 'Invalid verification code');
    }
  }

  return (
    <Container>
      <Head>
        <title>Log In | Safinity</title>
      </Head>

      <Stack.Screen options={{ headerShown: false }} />

      <Header variant="back" title="Log In" subtitle="Welcome back!" />

      <MainArea role="main">
        {pendingSignIn ? (
          <InputGroup>
            <InputField
              label="Verification code *"
              placeholder="Verification code"
              keyboardType="numeric"
              value={verificationCode}
              onChangeText={setVerificationCode}
              accessibilityState={{ required: true }}
            />

            {secondFactorHint ? <HintText>{secondFactorHint}</HintText> : null}
          </InputGroup>
        ) : (
          <>
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
          </>
        )}

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
          title={pendingSignIn ? 'Verify and continue' : 'Log In'}
          disabled={
            !isLoaded || (pendingSignIn ? verificationCode === '' : email === '' || password === '')
          }
          onPress={pendingSignIn ? handleVerifySecondFactor : handleLogin}
        />

        {pendingSignIn ? (
          <RowWithLink>
            <SmallText>Need to try again?</SmallText>

            <LinkArea
              role="link"
              onPress={() => {
                setPendingSignIn(null);
                setSecondFactorStrategy(null);
                setSecondFactorHint('');
                setVerificationCode('');
                setError('');
              }}
            >
              <LinkText>Back to login</LinkText>
            </LinkArea>
          </RowWithLink>
        ) : null}

        {!pendingSignIn ? (
          <RowWithLink>
            <SmallText>Don`t have an account?</SmallText>

            <LinkArea role="link" onPress={() => router.push('/register')}>
              <LinkText>Create Account</LinkText>
            </LinkArea>
          </RowWithLink>
        ) : null}
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

const HintText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.textoPequeno};
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  text-align: center;
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
