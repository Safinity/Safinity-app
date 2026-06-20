import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as WebBrowser from 'expo-web-browser';
import { useAuth, useClerk, useSignIn, useSSO } from '@clerk/expo';
import { useSignInWithApple } from '@clerk/expo/apple';
import { Platform } from 'react-native';

import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import Header from '@/components/ui/header';
import { getMyProfile } from '@/utils/profile';
import { Height, Spacing, Width } from '@/constants/theme';

WebBrowser.maybeCompleteAuthSession();

function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

type SocialProvider = 'Google' | 'Apple';

type SocialAuthResult = {
  createdSessionId?: string | null;
  authSessionResult?: { type?: string } | null;
  setActive?: (params: { session: string }) => Promise<void>;
  signIn?: any;
  signUp?: any;
};

type SecondFactorVerificationMode = 'classic' | 'future';

function normalizeUsername(value?: string | null) {
  const normalized = value
    ?.toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return normalized || undefined;
}

function getSocialSessionId(result: SocialAuthResult) {
  return (
    result.createdSessionId ||
    result.signUp?.createdSessionId ||
    result.signIn?.createdSessionId ||
    null
  );
}

function getSocialEmail(signUp: any) {
  return signUp?.emailAddress || signUp?.externalAccount?.emailAddress || null;
}

function canUseClassicSecondFactor(signInAttempt: any) {
  return (
    signInAttempt &&
    typeof signInAttempt.prepareSecondFactor === 'function' &&
    typeof signInAttempt.attemptSecondFactor === 'function'
  );
}

function getFutureSignIn(signInAttempt: any) {
  return signInAttempt?.mfa ? signInAttempt : signInAttempt?.__internal_future;
}

function getSignInStatus(signInAttempt: any) {
  return signInAttempt?.status ?? signInAttempt?.__internal_future?.status;
}

function getSupportedSecondFactors(signInAttempt: any) {
  return (
    signInAttempt?.supportedSecondFactors ??
    signInAttempt?.__internal_future?.supportedSecondFactors ??
    []
  );
}

export default function Login() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const { signOut } = clerk;
  // REMOVIDO: o setActive daqui, pois vamos usar o clerk.setActive que é 100% fiável
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const getTokenRef = useRef(getToken);
  const signOutRef = useRef(signOut);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingSignIn, setPendingSignIn] = useState<any>(null);
  const [secondFactorStrategy, setSecondFactorStrategy] = useState<
    'email_code' | 'phone_code' | 'totp' | 'backup_code' | null
  >(null);
  const [secondFactorMode, setSecondFactorMode] = useState<SecondFactorVerificationMode>('classic');
  const [secondFactorHint, setSecondFactorHint] = useState('');
  const [isCompletingLogin, setIsCompletingLogin] = useState(false);
  const [activeSocialProvider, setActiveSocialProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');
  const isSyncingProfileRef = useRef(false);

  const isSocialLoading = activeSocialProvider !== null;
  const isAppleSignInEnabled = process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === 'true';
  const canUseAppleSignIn = Platform.OS === 'ios' && isAppleSignInEnabled;

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
    await wait(500);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        const token = await getTokenRef.current({ skipCache: true });

        if (token) {
          await getMyProfile(token);
          return;
        }
      } catch (syncError) {
        console.warn('[Clerk-Auth] Falha temporária na API de perfil:', syncError);
        lastError = syncError;
      }
      await wait(650);
    }
    throw lastError || new Error('Unable to sync authenticated profile');
  }

  async function activateSessionIfAvailable(signInAttempt: any) {
    const createdSessionId =
      signInAttempt?.createdSessionId ||
      signInAttempt?.__internal_future?.createdSessionId ||
      signIn?.createdSessionId ||
      signIn?.__internal_future?.createdSessionId;

    if (!createdSessionId) {
      return false;
    }

    // CORREÇÃO: Usamos o clerk.setActive do hook useClerk que nunca falha
    if (!clerk || typeof clerk.setActive !== 'function') {
      console.error('[Clerk-Auth] Erro: Método clerk.setActive global indisponível.');
      return false;
    }

    setIsCompletingLogin(true);
    isSyncingProfileRef.current = true;

    try {
      await clerk.setActive({ session: createdSessionId });
      await syncProfileWithBackend();

      router.replace('/(tabs)');
      return true;
    } catch (syncError: any) {
      console.error('[Clerk-Auth] Erro crítico ao rodar o clerk.setActive:', syncError);
      isSyncingProfileRef.current = false;
      setIsCompletingLogin(false);
      setError(syncError?.message || 'Erro ao ativar a sessão.');
      return false;
    }
  }

  async function attemptPasswordSignIn() {
    const futureSignIn = signIn?.__internal_future;

    if (futureSignIn?.password) {
      const result = await futureSignIn.password({
        identifier: email.trim(),
        password,
      });

      if (result.error) {
        throw result.error;
      }

      return futureSignIn;
    }

    return signIn.create({
      identifier: email.trim(),
      password,
    } as any);
  }

  async function prepareSecondFactor(signInAttempt: any, factor: any) {
    console.warn('[Clerk-Auth] Clerk requested second factor:', {
      status: signInAttempt?.status,
      strategy: factor?.strategy,
      clientTrustState: signInAttempt?.clientTrustState,
    });

    if (canUseClassicSecondFactor(signInAttempt) && factor.strategy === 'email_code') {
      const prepared = await signInAttempt.prepareSecondFactor({
        strategy: 'email_code',
        emailAddressId: factor.emailAddressId,
      });
      setPendingSignIn(prepared);
      setSecondFactorStrategy('email_code');
      setSecondFactorMode('classic');
      return true;
    }

    if (canUseClassicSecondFactor(signInAttempt) && factor.strategy === 'phone_code') {
      const prepared = await signInAttempt.prepareSecondFactor({
        strategy: 'phone_code',
        phoneNumberId: factor.phoneNumberId,
      });
      setPendingSignIn(prepared);
      setSecondFactorStrategy('phone_code');
      setSecondFactorMode('classic');
      return true;
    }

    if (canUseClassicSecondFactor(signInAttempt)) {
      setPendingSignIn(signInAttempt);
      setSecondFactorStrategy(factor.strategy);
      setSecondFactorMode('classic');
      return true;
    }

    const futureSignIn = getFutureSignIn(signInAttempt);

    if (futureSignIn?.mfa && factor.strategy === 'email_code') {
      const result = await futureSignIn.mfa.sendEmailCode();

      if (result.error) {
        setError(result.error.message || 'Unable to send verification code.');
        return false;
      }

      setPendingSignIn(futureSignIn);
      setSecondFactorStrategy('email_code');
      setSecondFactorMode('future');
      return true;
    }

    if (futureSignIn?.mfa && factor.strategy === 'phone_code') {
      const result = await futureSignIn.mfa.sendPhoneCode();

      if (result.error) {
        setError(result.error.message || 'Unable to send verification code.');
        return false;
      }

      setPendingSignIn(futureSignIn);
      setSecondFactorStrategy('phone_code');
      setSecondFactorMode('future');
      return true;
    }

    if (futureSignIn?.mfa && (factor.strategy === 'totp' || factor.strategy === 'backup_code')) {
      setPendingSignIn(futureSignIn);
      setSecondFactorStrategy(factor.strategy);
      setSecondFactorMode('future');
      return true;
    }

    setError(
      'This account requires a second verification step, but the current Clerk sign-in object cannot prepare it. Please try again or review MFA/client trust settings in Clerk.',
    );
    return false;
  }

  async function verifySecondFactor() {
    if (secondFactorMode === 'future') {
      const futureSignIn = getFutureSignIn(pendingSignIn);

      if (!futureSignIn?.mfa || !secondFactorStrategy) {
        throw new Error('Unable to verify the second factor. Please restart sign in.');
      }

      const code = verificationCode.trim();
      const result =
        secondFactorStrategy === 'email_code'
          ? await futureSignIn.mfa.verifyEmailCode({ code })
          : secondFactorStrategy === 'phone_code'
            ? await futureSignIn.mfa.verifyPhoneCode({ code })
            : secondFactorStrategy === 'totp'
              ? await futureSignIn.mfa.verifyTOTP({ code })
              : await futureSignIn.mfa.verifyBackupCode({ code });

      if (result.error) {
        throw result.error;
      }

      return futureSignIn;
    }

    if (!pendingSignIn || typeof pendingSignIn.attemptSecondFactor !== 'function') {
      throw new Error('Unable to verify the second factor. Please restart sign in.');
    }

    return pendingSignIn.attemptSecondFactor({
      strategy: secondFactorStrategy,
      code: verificationCode.trim(),
    });
  }

  async function enterSecondFactorFlow(signInAttempt?: any) {
    const currentSignIn = signInAttempt ?? signIn;
    const status = getSignInStatus(currentSignIn) ?? getSignInStatus(signIn);
    const secondFactorSignIn =
      getSignInStatus(currentSignIn) === 'needs_second_factor' ||
      getSignInStatus(currentSignIn) === 'needs_client_trust'
        ? currentSignIn
        : signIn;

    if (status !== 'needs_second_factor' && status !== 'needs_client_trust') {
      console.warn('[Clerk-Auth] Ignoring second factor without required status:', {
        status,
      });
      return false;
    }

    const factors = getSupportedSecondFactors(secondFactorSignIn);
    const factor =
      factors.find((item: any) => item.strategy === 'email_code') ??
      factors.find((item: any) => item.strategy === 'phone_code') ??
      factors.find((item: any) => item.strategy === 'totp') ??
      factors.find((item: any) => item.strategy === 'backup_code');

    if (!factor) {
      setError(
        'This account requires a second verification step. Disable MFA/client trust for this account in Clerk to sign in with password only.',
      );
      return true;
    }

    const didPrepare = await prepareSecondFactor(secondFactorSignIn, factor);

    if (!didPrepare) {
      return true;
    }

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

    const status = getSignInStatus(signInAttempt) ?? getSignInStatus(signIn);
    const firstFactorVerified = signInAttempt.firstFactorVerification?.status === 'verified';
    const inferredStatus =
      status === 'needs_second_factor' || status === 'needs_client_trust'
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
    setSecondFactorMode('classic');
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
      setError(`Unable to complete sign in. Current ${statusMessage || 'status: unknown'}`);
    } catch (err: any) {
      console.error('[Clerk-Auth] Erro capturado no catch do handleLogin:', err);
      if (getSignInStatus(signIn) === 'needs_second_factor' && canUseClassicSecondFactor(signIn)) {
        if (await enterSecondFactorFlow(signIn)) {
          return;
        }
      }

      setError(
        err.errors?.[0]?.message || err.message || 'Unable to sync your account. Please try again.',
      );
    }
  }

  async function completeSocialSignUpIfNeeded(result: SocialAuthResult) {
    const signUp = result.signUp;
    const missingFields = signUp?.missingFields ?? [];

    if (!signUp || signUp.createdSessionId || !missingFields.length) {
      return result;
    }

    const email = getSocialEmail(signUp);
    const emailUsername = normalizeUsername(email?.split('@')[0]);
    const updatePayload: Record<string, string> = {};

    if (missingFields.includes('username') && !signUp.username && emailUsername) {
      updatePayload.username = emailUsername;
    }

    if (missingFields.includes('first_name') && !signUp.firstName) {
      updatePayload.firstName = emailUsername || 'Safinity';
    }

    if (missingFields.includes('last_name') && !signUp.lastName) {
      updatePayload.lastName = 'User';
    }

    if (!Object.keys(updatePayload).length || typeof signUp.update !== 'function') {
      return result;
    }

    const updatedSignUp = await signUp.update(updatePayload);
    return { ...result, signUp: updatedSignUp };
  }

  function getMissingSocialSessionMessage(provider: SocialProvider, result: SocialAuthResult) {
    if (result.authSessionResult?.type && result.authSessionResult.type !== 'success') {
      return `${provider} sign in was cancelled.`;
    }

    const signUpMissingFields = result.signUp?.missingFields?.join(', ');
    const clerkStatus = [
      result.signIn?.status ? `signIn: ${result.signIn.status}` : null,
      result.signUp?.status ? `signUp: ${result.signUp.status}` : null,
      signUpMissingFields ? `missing: ${signUpMissingFields}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    return `${provider} sign in did not return a session${clerkStatus ? ` (${clerkStatus})` : ''}.`;
  }

  async function activateSocialSession(provider: SocialProvider, authResult: SocialAuthResult) {
    const completedResult = await completeSocialSignUpIfNeeded(authResult);
    const createdSessionId = getSocialSessionId(completedResult);
    const activateSession =
      completedResult.setActive ||
      (clerk?.setActive ? (params: { session: string }) => clerk.setActive(params) : undefined);

    if (!createdSessionId) {
      console.warn('[Clerk-Auth] Social login finished without session:', {
        provider,
        authSessionType: completedResult.authSessionResult?.type,
        signInStatus: completedResult.signIn?.status,
        signUpStatus: completedResult.signUp?.status,
        signUpMissingFields: completedResult.signUp?.missingFields,
      });
      setError(getMissingSocialSessionMessage(provider, completedResult));
      isSyncingProfileRef.current = false;
      setActiveSocialProvider(null);
      setIsCompletingLogin(false);
      return;
    }

    if (!activateSession) {
      throw new Error(`Unable to activate ${provider} session. Please try again.`);
    }

    await activateSession({ session: createdSessionId });
    await syncProfileWithBackend();
    router.replace('/(tabs)');
  }

  function startSocialLoading(provider: SocialProvider) {
    if (!isLoaded) {
      setError('Authentication is still loading. Please try again.');
      return false;
    }

    setError('');
    setVerificationCode('');
    setPendingSignIn(null);
    setSecondFactorStrategy(null);
    setSecondFactorHint('');
    setActiveSocialProvider(provider);
    setIsCompletingLogin(true);
    isSyncingProfileRef.current = true;
    return true;
  }

  function stopSocialLoading() {
    isSyncingProfileRef.current = false;
    setActiveSocialProvider(null);
    setIsCompletingLogin(false);
  }

  async function handleGoogleLogin() {
    if (!startSocialLoading('Google')) {
      return;
    }

    try {
      const authResult = await startSSOFlow({
        strategy: 'oauth_google',
      });

      await activateSocialSession('Google', authResult);
    } catch (err: any) {
      console.error('[Clerk-Auth] Google login failed:', err);
      setError(
        err.errors?.[0]?.message ||
          err.message ||
          'Unable to sign in with Google. Please try again.',
      );
      stopSocialLoading();
    }
  }

  async function handleAppleLogin() {
    if (!isAppleSignInEnabled) {
      setError('Apple sign in is not enabled for this app environment.');
      return;
    }

    if (!canUseAppleSignIn) {
      setError('Apple sign in is only available on iOS.');
      return;
    }

    if (!startSocialLoading('Apple')) {
      return;
    }

    try {
      const authResult = await startAppleAuthenticationFlow();
      await activateSocialSession('Apple', authResult);
    } catch (err: any) {
      console.error('[Clerk-Auth] Apple login failed:', err);
      const clerkMessage = err.errors?.[0]?.message || err.message;
      const isAppleStrategyDisabled = clerkMessage?.includes('oauth_token_apple');

      setError(
        isAppleStrategyDisabled
          ? 'Apple sign in is not enabled in Clerk for this environment.'
          : clerkMessage || 'Unable to sign in with Apple. Please try again.',
      );
      stopSocialLoading();
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
            <Ionicons
              name="alert-circle"
              size={Width.iconAlert}
              color="#ff5252"
              style={{ marginRight: Spacing.sm }}
            />
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
            isSocialLoading ||
            !isLoaded ||
            (pendingSignIn ? verificationCode === '' : email === '' || password === '')
          }
          onPress={pendingSignIn ? handleVerifySecondFactor : handleLogin}
        />

        {!pendingSignIn ? (
          <>
            <SeparatorRow>
              <SeparatorLine />
              <SeparatorText>or</SeparatorText>
              <SeparatorLine />
            </SeparatorRow>

            <SocialButtonsGroup>
              <GoogleButton
                activeOpacity={0.85}
                $disabled={isCompletingLogin || isSocialLoading || !isLoaded}
                disabled={isCompletingLogin || isSocialLoading || !isLoaded}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
                accessibilityState={{
                  disabled: isCompletingLogin || isSocialLoading || !isLoaded,
                  busy: activeSocialProvider === 'Google',
                }}
                onPress={handleGoogleLogin}
              >
                <Ionicons name="logo-google" size={Width.iconSocial} color="#fff" />
                <GoogleButtonText>
                  {activeSocialProvider === 'Google' ? 'Connecting...' : 'Continue with Google'}
                </GoogleButtonText>
              </GoogleButton>

              {canUseAppleSignIn ? (
                <GoogleButton
                  activeOpacity={0.85}
                  $disabled={isCompletingLogin || isSocialLoading || !isLoaded}
                  disabled={isCompletingLogin || isSocialLoading || !isLoaded}
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Apple"
                  accessibilityState={{
                    disabled: isCompletingLogin || isSocialLoading || !isLoaded,
                    busy: activeSocialProvider === 'Apple',
                  }}
                  onPress={handleAppleLogin}
                >
                  <Ionicons name="logo-apple" size={Width.iconSocialLarge} color="#fff" />
                  <GoogleButtonText>
                    {activeSocialProvider === 'Apple' ? 'Connecting...' : 'Continue with Apple'}
                  </GoogleButtonText>
                </GoogleButton>
              ) : null}
            </SocialButtonsGroup>
          </>
        ) : null}

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

const SeparatorRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SeparatorLine = styled.View`
  flex: 1;
  height: ${Height.separatorLine}px;
  background-color: ${({ theme }) => theme.colors.grayNavbar};
`;

const SeparatorText = styled.Text`
  margin-horizontal: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.textoPequeno};
`;

const SocialButtonsGroup = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const GoogleButton = styled.TouchableOpacity<{ $disabled: boolean }>`
  height: ${Height.socialButton}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  border-width: ${Height.separatorLine}px;
  border-color: ${({ theme }) => theme.colors.palette.primary.light80};
  opacity: ${(props: { $disabled: boolean }) => (props.$disabled ? 0.65 : 1)};
`;

const GoogleButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-weight: 700;
  ${({ theme }) => theme.text.corpo.corpoTexto};
`;
