import { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as WebBrowser from 'expo-web-browser';
import { useAuth, useClerk, useSignIn, useSSO } from '@clerk/expo';
import { useSignInWithApple } from '@clerk/expo/apple';
import { Platform, TextInput, View, TouchableOpacity, Text } from 'react-native';

import PrimaryButton from '@/components/PrimaryButton';
import Header from '@/components/ui/header';
import { getMyProfile } from '@/utils/profile';
import { Height, Spacing, Width } from '@/constants/theme';
import { useThemePreference } from '@/context/ThemeContext';

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
  const theme = useTheme();
  const { themeMode } = useThemePreference();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const { signOut } = clerk;
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const getTokenRef = useRef(getToken);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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

  async function handleGoogleLogin() {
    if (!isLoaded) return;
    setActiveSocialProvider('Google');
    setIsCompletingLogin(true);
    try {
      const authResult = await startSSOFlow({ strategy: 'oauth_google' });
      await activateSocialSession('Google', authResult);
    } catch (err: any) {
      console.error('Google login failed:', err);
      setActiveSocialProvider(null);
      setIsCompletingLogin(false);
    }
  }

  async function handleAppleLogin() {
    if (!canUseAppleSignIn) return;
    setActiveSocialProvider('Apple');
    setIsCompletingLogin(true);
    try {
      const authResult = await startAppleAuthenticationFlow();
      await activateSocialSession('Apple', authResult);
    } catch (err: any) {
      console.error('Apple login failed:', err);
      setActiveSocialProvider(null);
      setIsCompletingLogin(false);
    }
  }

  async function activateSocialSession(provider: SocialProvider, authResult: SocialAuthResult) {
    const createdSessionId = getSocialSessionId(authResult);
    if (createdSessionId) {
      await clerk.setActive({ session: createdSessionId });
      await syncProfileWithBackend();
      router.replace('/(tabs)');
    } else {
      setError(`Unable to create session with ${provider}.`);
      setActiveSocialProvider(null);
      setIsCompletingLogin(false);
    }
  }

  return (
    <Container>
      <Head>
        <title>Log In | Safinity</title>
      </Head>

      <Stack.Screen options={{ headerShown: false }} />

      <Header
        variant="back"
        title="Log In"
        // Alteração: Subtitle agora é o "Welcome back!" estilizado
        subtitle="Welcome back!"
        // Cores padrões herdadas para manter contraste no Dark Mode
        titleColor={theme.colors.text}
        subtitleColor={theme.colors.textMuted}
      />

      <MainArea role="main">
        <InputGroup>
          <SemanticLabel color={theme.colors.text}>Email *</SemanticLabel>
          <InputWrapper color={theme.colors.palette.primary.light90} borderColor={theme.colors.palette.primary.light80}>
            <Ionicons name="mail-outline" size={Width.iconSocial} color={theme.colors.inactive} style={{ marginRight: Spacing.sm }} />
            <NativeInputField
              color={theme.colors.text}
              placeholder="Email"
              placeholderTextColor={theme.colors.inactive}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </InputWrapper>

          <SemanticLabel color={theme.colors.text}>Password *</SemanticLabel>
          <InputWrapper color={theme.colors.palette.primary.light90} borderColor={theme.colors.palette.primary.light80}>
            <NativeInputField
              color={theme.colors.text}
              placeholder="Password"
              placeholderTextColor={theme.colors.inactive}
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Ionicons
                name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={Width.iconSocialLarge}
                color={theme.colors.inactive}
              />
            </TouchableOpacity>
          </InputWrapper>
        </InputGroup>

        <RowWithLink>
          <SmallText>Forgot your password?</SmallText>
          <LinkArea role="link">
            {/* Alteração: Cor do Recover password agora é o roxo normal (#BE8EE0) */}
            <LinkText color={theme.colors.palette.primary.light40}>Recover password</LinkText>
          </LinkArea>
        </RowWithLink>

        {error ? (
          <ErrorArea accessible={true} accessibilityLiveRegion="assertive" role="alert">
            <Ionicons name="alert-circle" size={Width.iconAlert} color="#ff5252" style={{ marginRight: Spacing.sm }} />
            <ErrorText>{error}</ErrorText>
          </ErrorArea>
        ) : null}

        {/* Alteração: PrimaryButton herda a cor semântica 'primary' definida no theme.ts */}
        <PrimaryButton
          title={isCompletingLogin ? 'Logging in...' : 'Log In'}
          disabled={isCompletingLogin || !isLoaded || email === '' || password === ''}
          onPress={handleLogin}
          // Garante que o PrimaryButton usa a cor primary do tema ativo
          color={theme.colors.primary}
        />

        <SeparatorRow>
          <SeparatorLine />
          <SeparatorText>or</SeparatorText>
          <SeparatorLine />
        </SeparatorRow>

        <SocialButtonsGroup>
          <SocialButton onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={Width.iconSocial} color="#fff" />
            <SocialButtonText>Continue with Google</SocialButtonText>
          </SocialButton>

          {canUseAppleSignIn ? (
            <SocialButton onPress={handleAppleLogin}>
              <Ionicons name="logo-apple" size={Width.iconSocialLarge} color="#fff" />
              <SocialButtonText>Continue with Apple</SocialButtonText>
            </SocialButton>
          ) : null}
        </SocialButtonsGroup>

        <RowWithLink>
          <SmallText>Don`t have an account?</SmallText>
          <LinkArea role="link" onPress={() => router.push('/register')}>
            {/* Alteração: Cor do Create Account agora é o roxo normal (#BE8EE0) */}
            <LinkText color={theme.colors.palette.primary.light40}>Create Account</LinkText>
          </LinkArea>
        </RowWithLink>
      </MainArea>
    </Container>
  );
}

// --- Styled Components ---

const Container = styled.View`
  flex: 1;
  padding-top: ${Spacing.xxxl}px;
  padding-horizontal: ${Spacing.margemLateral}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainArea = styled.View`
  flex: 1;
  margin-top: ${Spacing.lg}px;
`;

const InputGroup = styled.View`
  margin-bottom: ${Spacing.lg}px;
`;

const SemanticLabel = styled.Text<{ color: string }>`
  font-family: ${({ theme }) => theme.fonts.weights.medium};
  font-size: ${({ theme }) => theme.fonts.sizes.base}px;
  color: ${props => props.color};
  margin-bottom: ${Spacing.xs}px;
  margin-top: ${Spacing.md}px;
`;

const InputWrapper = styled.View<{ color: string; borderColor: string }>`
  height: ${Height.socialButton}px;
  background-color: ${props => props.color};
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  border-width: ${Height.separatorLine}px;
  border-color: ${props => props.borderColor};
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${Spacing.sm}px;
  margin-bottom: ${Spacing.sm}px;
`;

const NativeInputField = styled(TextInput)<{ color: string }>`
  flex: 1;
  height: 100%;
  font-family: ${({ theme }) => theme.fonts.weights.regular};
  font-size: ${({ theme }) => theme.fonts.sizes.base}px;
  color: ${props => props.color};
`;

const RowWithLink = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-vertical: ${Spacing.md}px;
`;

const SmallText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.fonts.weights.regular};
  font-size: ${({ theme }) => theme.fonts.sizes.sm}px;
`;

const LinkArea = styled.TouchableOpacity`
  margin-left: ${Spacing.xs}px;
`;

// Alteração: LinkText agora aceita uma propriedade de cor dinâmica
const LinkText = styled.Text<{ color: string }>`
  /* Usa a cor passada por prop, senão fallback para Colors.palette.primary.light80 */
  color: ${props => props.color || props.theme.colors.palette.primary.light80};
  font-family: ${({ theme }) => theme.fonts.weights.semibold};
  font-size: ${({ theme }) => theme.fonts.sizes.sm}px;
`;

const ErrorArea = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${Spacing.sm}px;
  margin-bottom: ${Spacing.md}px;
`;

const ErrorText = styled.Text`
  color: #ff5252;
  font-family: ${({ theme }) => theme.fonts.weights.medium};
  font-size: ${({ theme }) => theme.fonts.sizes.sm}px;
`;

const SeparatorRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: ${Spacing.lg}px;
`;

const SeparatorLine = styled.View`
  flex: 1;
  height: ${Height.separatorLine}px;
  background-color: ${({ theme }) => theme.colors.inactive};
  opacity: 0.3;
`;

const SeparatorText = styled.Text`
  margin-horizontal: ${Spacing.md}px;
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.fonts.weights.medium};
  font-size: ${({ theme }) => theme.fonts.sizes.sm}px;
`;

const SocialButtonsGroup = styled.View`
  gap: ${Spacing.md}px;
  margin-bottom: ${Spacing.xl}px;
`;

const SocialButton = styled.TouchableOpacity`
  height: ${Height.socialButton}px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${Spacing.sm}px;
`;

const SocialButtonText = styled.Text`
  color: #fff;
  font-family: ${({ theme }) => theme.fonts.weights.semibold};
  font-size: ${({ theme }) => theme.fonts.sizes.base}px;
`;