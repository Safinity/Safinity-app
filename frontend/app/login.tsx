import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { useAuth, useClerk, useSignIn } from '@clerk/expo';

import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import Header from '@/components/ui/header';
import { getMyProfile } from '@/utils/profile';

function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default function Login() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const { signOut } = clerk;
  // REMOVIDO: o setActive daqui, pois vamos usar o clerk.setActive que é 100% fiável
  const { signIn } = useSignIn();
  const getTokenRef = useRef(getToken);
  const signOutRef = useRef(signOut);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingSignIn, setPendingSignIn] = useState<any>(null);
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<
    'email_code' | 'phone_code' | 'totp' | 'backup_code' | null
  >(null);
  const [secondFactorHint, setSecondFactorHint] = useState('');
  const [isCompletingLogin, setIsCompletingLogin] = useState(false);
  const [error, setError] = useState('');
  const isSyncingProfileRef = useRef(false);

  getTokenRef.current = getToken;
  signOutRef.current = signOut;

  // Monitora o estado global de autenticação do app
  useEffect(() => {
    if (!isLoaded || !isSignedIn || isSyncingProfileRef.current) {
      return;
    }

    let isActive = true;

    async function completeAuthenticatedLogin() {
      try {
        isSyncingProfileRef.current = true;
        setIsCompletingLogin(true);
        setError('');

        await syncProfileWithBackend();

        if (isActive) {
          router.replace('/(tabs)');
        }
      } catch (syncError: any) {
        console.error('[Clerk-Auth] Erro ao sincronizar perfil no useEffect:', syncError);
        isSyncingProfileRef.current = false;
        setIsCompletingLogin(false);

        if (isActive) {
          setError('Autenticado com sucesso. A redirecionar...');
          setTimeout(() => {
            if (isActive) router.replace('/(tabs)');
          }, 1000);
        }
      }
    }

    completeAuthenticatedLogin();

    return () => {
      isActive = false;
    };
  }, [isLoaded, isSignedIn]);

  async function syncProfileWithBackend() {
    let lastError: unknown = null;
    await wait(400);

    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const token = await getTokenRef.current();

        if (token) {
          await getMyProfile(token);
          return;
        }
      } catch (syncError) {
        console.warn('[Clerk-Auth] Falha temporária na API de perfil:', syncError);
        lastError = syncError;
      }
      await wait(500);
    }
    throw lastError || new Error('Unable to sync authenticated profile');
  }

  async function activateSessionIfAvailable(signInAttempt: any) {
    const createdSessionId = signInAttempt?.createdSessionId || signIn?.createdSessionId;

    if (!createdSessionId) {
      return false;
    }

    // CORREÇÃO: Usamos o clerk.setActive do hook useClerk que nunca falha
    if (!clerk || typeof clerk.setActive !== 'function') {
      console.error('[Clerk-Auth] Erro: Método clerk.setActive global indisponível.');
      return false;
    }

    setIsCompletingLogin(true);

    try {
      await clerk.setActive({ session: createdSessionId });

      router.replace('/(tabs)');
      return true;
    } catch (syncError: any) {
      console.error('[Clerk-Auth] Erro crítico ao rodar o clerk.setActive:', syncError);
      setIsCompletingLogin(false);
      setError(syncError?.message || 'Erro ao ativar a sessão.');
      return false;
    }
  }

  async function attemptPasswordSignIn() {
    return signIn.create({
      identifier: email.trim(),
      password,
    } as any);
  }

  async function prepareSecondFactor(signInAttempt: any, factor: any) {
    if (factor.strategy === 'email_code') {
      const prepared = await signInAttempt.prepareSecondFactor({
        strategy: 'email_code',
        emailAddressId: factor.emailAddressId,
      });
      setPendingSignIn(prepared);
      setSecondFactorStrategy('email_code');
      return;
    }

    if (factor.strategy === 'phone_code') {
      const prepared = await signInAttempt.prepareSecondFactor({
        strategy: 'phone_code',
        phoneNumberId: factor.phoneNumberId,
      });
      setPendingSignIn(prepared);
      setSecondFactorStrategy('phone_code');
      return;
    }

    setPendingSignIn(signInAttempt);
    setSecondFactorStrategy(factor.strategy);
  }

  async function verifySecondFactor() {
    return pendingSignIn.attemptSecondFactor({
      strategy: secondFactorStrategy,
      code: verificationCode.trim(),
    });
  }

  async function enterSecondFactorFlow(signInAttempt?: any) {
    const currentSignIn = signInAttempt ?? signIn;
    const factors = currentSignIn?.supportedSecondFactors ?? signIn.supportedSecondFactors ?? [];
    const factor =
      factors.find((item: any) => item.strategy === 'email_code') ??
      factors.find((item: any) => item.strategy === 'phone_code') ??
      factors.find((item: any) => item.strategy === 'totp') ??
      factors.find((item: any) => item.strategy === 'backup_code');

    if (!factor) {
      setError('This account requires an unsupported second factor.');
      return true;
    }

    await prepareSecondFactor(currentSignIn, factor);
    setSecondFactorHint(
      factor.strategy === 'email_code'
        ? `Enter the code sent to ${factor.safeIdentifier || 'your email'}`
        : factor.strategy === 'phone_code'
          ? `Enter the code sent to ${factor.safeIdentifier || 'your phone'}`
          : factor.strategy === 'totp'
            ? 'Enter the code from your authenticator app'
            : 'Enter one of your backup codes',
    );
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

  async function continueSignIn(signInAttempt: any, depth = 0): Promise<boolean> {
    if (await activateSessionIfAvailable(signInAttempt)) {
      return true;
    }

    const status = signInAttempt.status;
    const firstFactorVerified = signInAttempt.firstFactorVerification?.status === 'verified';
    const supportedSecondFactors = signInAttempt.supportedSecondFactors ?? [];
    const inferredStatus =
      status === 'needs_second_factor' || (firstFactorVerified && supportedSecondFactors.length)
        ? 'needs_second_factor'
        : status;

    if (inferredStatus === 'needs_first_factor' && !firstFactorVerified) {
      if (!signInAttempt.attemptFirstFactor) {
        setError('Unable to complete sign in. Please try again.');
        return true;
      }

      const firstFactorAttempt = await signInAttempt.attemptFirstFactor({
        strategy: 'password',
        password,
      });

      return continueSignIn(firstFactorAttempt, depth + 1);
    }

    if (inferredStatus === 'needs_second_factor') {
      return enterSecondFactorFlow(signInAttempt);
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
      const signInAttempt = await attemptPasswordSignIn();

      if (await continueSignIn(signInAttempt)) {
        return;
      }

      const statusMessage = getSignInStatusMessage(signInAttempt);
      if (statusMessage.includes('needs_second_factor')) {
        await enterSecondFactorFlow(signInAttempt);
        return;
      }

      setError(`Unable to complete sign in. Current ${statusMessage || 'status: unknown'}`);
    } catch (err: any) {
      console.error('[Clerk-Auth] Erro capturado no catch do handleLogin:', err);
      if (signIn.status === 'needs_second_factor') {
        await enterSecondFactorFlow(signIn);
        return;
      }

      setError(
        err.errors?.[0]?.message || err.message || 'Unable to sync your account. Please try again.',
      );
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
      const signInAttempt = await verifySecondFactor();

      if (await activateSessionIfAvailable(signInAttempt)) {
        return;
      }

      setError(
        `Unable to complete sign in. Current ${getSignInStatusMessage(signInAttempt) || 'status: unknown'}`,
      );
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || err.message || 'Unable to sync your account. Please try again.',
      );
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
          title={
            isCompletingLogin ? 'Logging in...' : pendingSignIn ? 'Verify and continue' : 'Log In'
          }
          disabled={
            isCompletingLogin ||
            !isLoaded ||
            (pendingSignIn ? verificationCode === '' : email === '' || password === '')
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
