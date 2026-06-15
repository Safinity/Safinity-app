import { create } from 'axios';

import { API_BASE } from './api';

const profileApi = create({
  baseURL: API_BASE,
  timeout: 10000,
});

export type ProfileEvent = {
  id: string;
  name: string | null;
  venue_name?: string | null;
  description?: string | null;
  status?: string | null;
  category?: string | null;
  start_date?: string | null;
  end_date?: string | null;
};

export type ProfileTicket = {
  id: string;
  event_id: string;
  ticket_code: string;
  linked_at: string | null;
  event: ProfileEvent;
};

export type AuthenticatedProfile = {
  id: string;
  clerk_id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  role: string;
  email: string | null;
  emergency_contact: string | null;
  user_tickets: ProfileTicket[];
  user_favorites: unknown[];
};

export type UpdateProfilePayload = {
  name?: string;
  username?: string;
};

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getMyProfile(token: string | null) {
  const response = await profileApi.get<AuthenticatedProfile>('/auth/me', {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function updateMyProfile(token: string | null, payload: UpdateProfilePayload) {
  const response = await profileApi.patch('/users/me/edit-profile', payload, {
    headers: authHeaders(token),
  });

  return response.data;
}
