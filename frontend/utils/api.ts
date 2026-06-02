import { create } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = create({ baseURL: API_BASE });

api.interceptors.request.use(async config => {
  const token = await SecureStore.getItemAsync('clerk-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
