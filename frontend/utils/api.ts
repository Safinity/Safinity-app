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
  (expoHost ? `http://${expoHost}:${API_PORT}` : undefined) ||
  process.env.EXPO_PUBLIC_API_URL ||
  LOCALHOST_API_URL;

const api = create({ baseURL: API_BASE });

api.interceptors.request.use(async config => {
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
