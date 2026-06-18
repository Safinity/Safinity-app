import { create } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_PORT = '3000';
const LOCALHOST_API_URL = `http://localhost:${API_PORT}`;

const expoHostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || '';
const expoHost = expoHostUri
  .replace(/^[a-z]+:\/\//i, '')
  .split('/')[0]
  ?.split(':')[0];

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (expoHost ? `http://${expoHost}:${API_PORT}` : undefined) ||
  LOCALHOST_API_URL;

const api = create({ baseURL: API_BASE });

api.interceptors.request.use(async config => {
  const headers = config.headers as
    | {
        Authorization?: string;
        authorization?: string;
        get?: (name: string) => unknown;
      }
    | undefined;
  const hasExplicitAuthorization = Boolean(
    headers?.Authorization || headers?.authorization || headers?.get?.('Authorization'),
  );

  if (hasExplicitAuthorization) {
    return config;
  }

  if (Platform.OS !== 'web') {
    try {
      const token = await SecureStore.getItemAsync('clerk-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore is not always available in every Expo runtime.
      // Requests can still use explicit Authorization headers from Clerk.
    }
  }

  return config;
});

export default api;
