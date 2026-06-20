import { useEffect, useState } from 'react';
import { router, Stack } from 'expo-router';
import styled, { useTheme } from 'styled-components/native';
import { ImageBackground, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import * as WebBrowser from 'expo-web-browser';
import { useAuth, useClerk, useSSO } from '@clerk/expo';
import { useSignInWithApple } from '@clerk/expo/apple';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { getMyProfile } from '../utils/profile';
import { Height, Spacing, Width } from '../constants/theme';
import { StaticImages } from '../assets/images/landing';

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

export default function Landing() {
  const theme = useTheme();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const { startSSOFlow } = useSSO();
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const [activeSocialProvider, setActiveSocialProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState('');

  const isSocialLoading = activeSocialProvider !== null;
  const isAppleSignInEnabled = process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === 'true';
  const canUseAppleSignIn = Platform.OS === 'ios' && isAppleSignInEnabled;

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn]);

  async function syncProfileWithBackend() {
    let lastError: unknown = null;
    await wait(500);
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        const token = await getToken({ skipCache: true });
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
    ].filter(Boolean).join(', ');
    return `${provider} sign in did not return a session${clerkStatus ? ` (${clerkStatus})` : ''}.`;
  }

  async function activateSocialSession(provider: SocialProvider, authResult: SocialAuthResult) {
    const completedResult = await completeSocialSignUpIfNeeded(authResult);
    const createdSessionId = getSocialSessionId(completedResult);
    const activateSession = completedResult.setActive || (clerk?.setActive ? (params: { session: string }) => clerk.setActive(params) : undefined);
    if (!createdSessionId) {
      setError(getMissingSocialSessionMessage(provider, completedResult));
      setActiveSocialProvider(null);
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
    setActiveSocialProvider(provider);
    return true;
  }

  function stopSocialLoading() {
    setActiveSocialProvider(null);
  }

  async function handleGoogleLogin() {
    if (!startSocialLoading('Google')) return;
    try {
      const authResult = await startSSOFlow({ strategy: 'oauth_google' });
      await activateSocialSession('Google', authResult);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || 'Unable to sign in with Google. Please try again.');
      stopSocialLoading();
    }
  }

  async function handleAppleLogin() {
    if (!canUseAppleSignIn) return;
    if (!startSocialLoading('Apple')) return;
    try {
      const authResult = await startAppleAuthenticationFlow();
      await activateSocialSession('Apple', authResult);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || 'Unable to sign in with Apple. Please try again.');
      stopSocialLoading();
    }
  }

  return (
    <Background source={theme.colors.mode === 'light' ? require('../assets/images/Landing-light.png') : StaticImages.landingBg}>
      <Head><title>Welcome to Safinity!</title></Head>
      <Stack.Screen options={{ title: 'Welcome to Safinity!', headerShown: false }} />

      <LogoArea>
        <LogoImage
          source={theme.colors.mode === 'light' ? require('../assets/images/Logo-light.png') : require('../assets/logos/logo-ss.png')}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="Safinity"
        />
      </LogoArea>

      <Content role="main">
        {error ? (
          <ErrorArea accessible={true} accessibilityLiveRegion="assertive" role="alert">
            <Ionicons name="alert-circle" size={Width.iconAlert} color="#ff5252" style={{ marginRight: Spacing.sm }} />
            <ErrorText>{error}</ErrorText>
          </ErrorArea>
        ) : null}

        <SocialButton onPress={handleGoogleLogin} disabled={isSocialLoading || !isLoaded}>
          <Ionicons name="logo-google" size={Width.iconSocial} color={theme.colors.mode === 'dark' ? '#000000' : '#FFFFFF'} />
          <SocialButtonText>
            {activeSocialProvider === 'Google' ? 'Connecting...' : 'Continue with Google'}
          </SocialButtonText>
        </SocialButton>

        {canUseAppleSignIn ? (
          <SocialButton onPress={handleAppleLogin} disabled={isSocialLoading || !isLoaded}>
            <Ionicons name="logo-apple" size={Width.iconSocialLarge} color={theme.colors.mode === 'dark' ? '#000000' : '#FFFFFF'} />
            <SocialButtonText>
              {activeSocialProvider === 'Apple' ? 'Connecting...' : 'Continue with Apple'}
            </SocialButtonText>
          </SocialButton>
        ) : null}

        <SeparatorRow>
          <SeparatorLine />
          <SeparatorText>or</SeparatorText>
          <SeparatorLine />
        </SeparatorRow>

        <PrimaryButton title="Log in" onPress={() => router.push('/login')} />
        <SecondaryButton title="Create account" onPress={() => router.push('/register')} />
      </Content>
    </Background>
  );
}

const Background = styled(ImageBackground).attrs({ imageStyle: { resizeMode: 'cover' } })`
  flex: 1;
  width: 100%;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LogoArea = styled.View`
  position: absolute;
  top: 44%;
  left: 0;
  right: 0;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
`;

const LogoImage = styled.Image`
  align-self: center;
  width: ${Width.landingLogo}px;
  height: ${Height.landingLogo}px;
`;

const Content = styled.View`
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const SocialButton = styled.TouchableOpacity`
  height: ${Height.socialButton}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme }) => (theme.colors.mode === 'dark' ? '#FFFFFF' : '#333333')};
`;

const SocialButtonText = styled.Text`
  color: ${({ theme }) => (theme.colors.mode === 'dark' ? '#000000' : '#FFFFFF')};
  font-weight: 400;
  font-size: 16px;
`;

const ErrorArea = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: rgba(34, 39, 52, 0.85);
`;

const ErrorText = styled.Text`
  color: #ff5252;
  text-align: center;
  font-weight: bold;
`;

const SeparatorRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SeparatorLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: #777;
`;

const SeparatorText = styled.Text`
  margin-horizontal: ${({ theme }) => theme.spacing.md}px;
  color: #999;
`;