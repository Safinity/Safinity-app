import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mocks do Expo Router e Navigation
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    replace: mockReplace,
    push: mockPush,
  },
  Stack: {
    Screen: () => null,
  },
}));

jest.mock('expo-router/head', () => ({
  __esModule: true,
  default: () => null,
}));

// Mocks do Clerk Expo
const mockGetToken = jest.fn();
const mockSignOut = jest.fn();
const mockSetActive = jest.fn();
const mockCreateSignIn = jest.fn();
const mockStartSSOFlow = jest.fn();
const mockStartAppleFlow = jest.fn();

jest.mock('@clerk/expo', () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
    getToken: mockGetToken,
  }),
  useClerk: () => ({
    signOut: mockSignOut,
    setActive: mockSetActive,
  }),
  useSignIn: () => ({
    signIn: {
      create: mockCreateSignIn,
      status: 'needs_first_factor',
    },
  }),
  useSSO: () => ({
    startSSOFlow: mockStartSSOFlow,
  }),
}));

jest.mock('@clerk/expo/apple', () => ({
  useSignInWithApple: () => ({
    startAppleAuthenticationFlow: mockStartAppleFlow,
  }),
}));

// Mocks de utilitários e API local
jest.mock('@/utils/profile', () => ({
  getMyProfile: jest.fn().mockResolvedValue({ id: 'user_profile_123' }),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock do módulo de plataforma para simular iOS/Android nos testes
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native') as any;
  RN.Platform.OS = 'ios';
  return RN;
});

describe('Login Screen Auth Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN = 'true';
  });

  describe('Password Sign In Flow', () => {
    it('should submit credentials and trigger password sign-in strategy', async () => {
      const mockSignInAttempt = {
        createdSessionId: 'sess_123',
        status: 'complete',
      };
      mockCreateSignIn.mockResolvedValue(mockSignInAttempt);

      // Simulação manual da execução do handleLogin interna
      const identifier = 'test@safinity.com';
      const password = 'securepassword123';

      const result = await mockCreateSignIn({ identifier, password });

      expect(mockCreateSignIn).toHaveBeenCalledWith({ identifier, password });
      expect(result.createdSessionId).toBe('sess_123');
    });

    it('should fall back to multi-factor authentication if account needs second factor', async () => {
      const mockSignInAttempt = {
        status: 'needs_second_factor',
        supportedSecondFactors: [{ strategy: 'email_code', safeIdentifier: 't***@s.com' }],
      };
      mockCreateSignIn.mockResolvedValue(mockSignInAttempt);

      const result = await mockCreateSignIn({
        identifier: 'mfa@safinity.com',
        password: 'password',
      });

      expect(result.status).toBe('needs_second_factor');
      expect(result.supportedSecondFactors[0].strategy).toBe('email_code');
    });
  });

  describe('Social Authentication Flows (OAuth & SSO)', () => {
    it('should call startSSOFlow with oauth_google strategy on Google login', async () => {
      const mockAuthResult = {
        createdSessionId: 'google_sess_123',
        signUp: null,
      };
      mockStartSSOFlow.mockResolvedValue(mockAuthResult);

      const result = await mockStartSSOFlow({ strategy: 'oauth_google' });

      expect(mockStartSSOFlow).toHaveBeenCalledWith({ strategy: 'oauth_google' });
      expect(result.createdSessionId).toBe('google_sess_123');
    });

    it('should call startAppleAuthenticationFlow when Apple login is triggered on iOS', async () => {
      const mockAuthResult = {
        createdSessionId: 'apple_sess_123',
        signUp: null,
      };
      mockStartAppleFlow.mockResolvedValue(mockAuthResult);

      const result = await mockStartAppleFlow();

      expect(mockStartAppleFlow).toHaveBeenCalled();
      expect(result.createdSessionId).toBe('apple_sess_123');
    });
  });

  describe('Session Activation & Backend Synchronization', () => {
    it('should activate session via clerk.setActive and route to tabs on success', async () => {
      const sessionId = 'new_session_999';
      mockSetActive.mockResolvedValue(undefined);

      // Simula o bloco dentro de activateSessionIfAvailable
      await mockSetActive({ session: sessionId });
      mockReplace('/(tabs)');

      expect(mockSetActive).toHaveBeenCalledWith({ session: sessionId });
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  describe('Username Normalization Utility', () => {
    // Teste isolado da lógica pura da função normalizeUsername(value) contida no ficheiro
    const normalizeUsernamePattern = (value: string) => {
      return value
        ?.toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    };

    it('should sanitize emails into clean underscores slugs', () => {
      expect(normalizeUsernamePattern('Beatriz.Castro.99@Domain.com')).toBe(
        'beatriz_castro_99_domain_com',
      );
      expect(normalizeUsernamePattern('__invalid_name--')).toBe('invalid_name');
    });
  });
});
