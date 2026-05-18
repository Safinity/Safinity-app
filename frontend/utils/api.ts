import { create } from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = create({ baseURL: API_BASE });
export default api;
