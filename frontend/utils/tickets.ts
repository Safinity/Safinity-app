import { create } from 'axios';

import { API_BASE } from './api';

const ticketsApi = create({
  baseURL: API_BASE,
  timeout: 10000,
});

export type UserTicketEvent = {
  id: string;
  name: string | null;
  venue_name: string | null;
  description: string | null;
  status: string | null;
  category: string | null;
  image: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type UserTicket = {
  id: string;
  user_id: string;
  event_id: string;
  ticket_code: string;
  linked_at: string | null;
  event: UserTicketEvent | null;
};

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getUserTickets(token: string | null) {
  const response = await ticketsApi.get<UserTicket[]>('/user-tickets', {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function linkUserTicket(
  token: string | null,
  ticketCode: string,
  eventId?: string | string[],
) {
  const normalizedEventId = Array.isArray(eventId) ? eventId[0] : eventId;
  const response = await ticketsApi.post<{ message: string; data: UserTicket }>(
    '/user-tickets',
    {
      ticket_code: ticketCode.trim().toUpperCase(),
      ...(normalizedEventId ? { event_id: normalizedEventId } : {}),
    },
    {
      headers: authHeaders(token),
    },
  );

  return response.data;
}

export async function deleteUserTicket(token: string | null, ticketId: string) {
  const response = await ticketsApi.delete<{ message: string }>(`/user-tickets/${ticketId}`, {
    headers: authHeaders(token),
  });

  return response.data;
}
