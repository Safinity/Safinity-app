import api from './api';

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getEventFavouriteActivities(token: string | null, eventId: string | number) {
  const response = await api.get(`/events/${eventId}/favourites`, {
    headers: authHeaders(token),
  });

  return Array.isArray(response.data) ? response.data : response.data?.results || [];
}

export async function addFavouriteActivity(token: string | null, activityId: string | number) {
  const response = await api.post(
    '/events/favourite',
    { activity_id: activityId },
    { headers: authHeaders(token) },
  );

  return response.data;
}

export async function removeFavouriteActivity(token: string | null, activityId: string | number) {
  const response = await api.delete(`/events/favourite/${activityId}`, {
    headers: authHeaders(token),
  });

  return response.data;
}
