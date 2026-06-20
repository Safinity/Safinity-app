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
  image?: string | null;
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
  imageBase64?: string;
  imageMimeType?: string;
};

type EventImageLookup = Record<string, string | null | undefined>;

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getMyProfile(token: string | null) {
  const response = await profileApi.get<AuthenticatedProfile>('/auth/me', {
    headers: authHeaders(token),
  });

  return response.data;
}

async function fetchMissingEventImages(token: string | null, profile: AuthenticatedProfile) {
  const missingEventIds = Array.from(
    new Set(
      profile.user_tickets
        .map(ticket => ticket.event?.id || ticket.event_id)
        .filter((eventId, index) => eventId && !profile.user_tickets[index]?.event?.image),
    ),
  );

  if (!missingEventIds.length) {
    return {};
  }

  const eventResponses = await Promise.allSettled(
    missingEventIds.map(async eventId => {
      const response = await profileApi.get<ProfileEvent>(`/events/${eventId}`, {
        headers: authHeaders(token),
      });

      return [eventId, response.data.image] as const;
    }),
  );

  return eventResponses.reduce<EventImageLookup>((imagesByEventId, response) => {
    if (response.status === 'fulfilled') {
      const [eventId, image] = response.value;
      imagesByEventId[eventId] = image;
    }

    return imagesByEventId;
  }, {});
}

export async function getMyProfileWithEventImages(token: string | null) {
  const profile = await getMyProfile(token);
  const imagesByEventId = await fetchMissingEventImages(token, profile);

  if (!Object.keys(imagesByEventId).length) {
    return profile;
  }

  return {
    ...profile,
    user_tickets: profile.user_tickets.map(ticket => {
      const eventId = ticket.event?.id || ticket.event_id;
      const image = eventId ? imagesByEventId[eventId] : undefined;

      if (!ticket.event || !image || ticket.event.image) {
        return ticket;
      }

      return {
        ...ticket,
        event: {
          ...ticket.event,
          image,
        },
      };
    }),
  };
}

export async function updateMyProfile(token: string | null, payload: UpdateProfilePayload) {
  const response = await profileApi.patch('/users/me/edit-profile', payload, {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function deleteMyAccount(token: string | null) {
  const response = await profileApi.delete('/users/me', {
    headers: authHeaders(token),
  });

  return response.data;
}
