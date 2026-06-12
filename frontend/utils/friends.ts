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
