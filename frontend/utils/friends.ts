import { create } from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const friendsApi = create({
  baseURL: API_BASE,
  timeout: 10000,
});

export type FriendQrResponse = {
  payload: string;
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
};

export type AddFriendQrResponse = {
  state: string;
  friendshipId: string;
  friend: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
};

export type PreviewFriendQrResponse = {
  friend: AddFriendQrResponse['friend'];
};

export type FriendListItem = AddFriendQrResponse['friend'] & {
  isOnSameEvent: boolean;
};

export type FriendsGroupedResponse = {
  onSameEvent: FriendListItem[];
  otherFriends: FriendListItem[];
};

export type FriendSearchItem = AddFriendQrResponse['friend'];

export type FriendProfileResponse = AddFriendQrResponse['friend'] & {
  totalEventsCount: number;
  commonEvents: Array<{
    id: string;
    name?: string | null;
    title?: string | null;
    image?: string | null;
    category?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    duration?: string | null;
    location?: string | null;
    status?: string | null;
    validity?: string | null;
    description?: string | null;
    time_left?: string | null;
  }>;
};

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getFriends(token: string | null) {
  const response = await friendsApi.get<FriendsGroupedResponse>('/friends/all', {
    headers: authHeaders(token),
    params: { pageSize: 100 },
  });

  return response.data;
}

export async function toggleFriendship(token: string | null, friendId: string) {
  const response = await friendsApi.post(`/friends/toggle/${friendId}`, undefined, {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function searchUsers(token: string | null, query: string) {
  const response = await friendsApi.get<FriendSearchItem[]>('/friends/search', {
    headers: authHeaders(token),
    params: {
      q: query,
      pageSize: 20,
    },
  });

  return response.data;
}

export async function getFriendProfile(token: string | null, friendId: string) {
  const response = await friendsApi.get<FriendProfileResponse>(`/friends/profile/${friendId}`, {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function getMyFriendQrCode(token: string | null) {
  const response = await friendsApi.get<FriendQrResponse>('/friends/qr/me', {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function addFriendFromQrPayload(token: string | null, payload: string) {
  const response = await friendsApi.post<AddFriendQrResponse>(
    '/friends/qr/add',
    { payload },
    {
      headers: authHeaders(token),
    },
  );

  return response.data;
}

export async function previewFriendFromQrPayload(token: string | null, payload: string) {
  const response = await friendsApi.post<PreviewFriendQrResponse>(
    '/friends/qr/preview',
    { payload },
    {
      headers: authHeaders(token),
    },
  );

  return response.data;
}
