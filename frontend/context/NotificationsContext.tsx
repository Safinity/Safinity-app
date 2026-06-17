import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/expo';

import api, { API_BASE } from '@/utils/api';

type NotificationsContextValue = {
  unreadCount: number;
  realtimeVersion: number;
  refreshNotifications: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadCount: 0,
  realtimeVersion: 0,
  refreshNotifications: async () => undefined,
});

function getRealtimeUrl(token: string) {
  return `${API_BASE.replace(/^http/, 'ws')}/notifications/realtime?token=${encodeURIComponent(token)}`;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [realtimeVersion, setRealtimeVersion] = useState(0);
  const getTokenRef = useRef(getToken);

  getTokenRef.current = getToken;

  const getFreshToken = useCallback(async () => {
    const getTokenWithOptions = getTokenRef.current as (options?: unknown) => Promise<string | null>;
    return getTokenWithOptions({ skipCache: true });
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setUnreadCount(0);
      return;
    }

    const token = await getFreshToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const [notificationsResponse, pendingRequestsResponse] = await Promise.all([
      api.get('/notifications/me', { headers }),
      api.get('/friends/requests/pending', { headers }),
    ]);
    const notifications = Array.isArray(notificationsResponse.data) ? notificationsResponse.data : [];
    const pendingRequests = Array.isArray(pendingRequestsResponse.data)
      ? pendingRequestsResponse.data
      : [];
    const unreadNotifications = notifications.filter(notification => !notification.read).length;

    setUnreadCount(unreadNotifications + pendingRequests.length);
  }, [getFreshToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;

    refreshNotifications().catch(() => {
      setUnreadCount(0);
    });
  }, [isLoaded, refreshNotifications]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    const clearReconnect = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    const scheduleReconnect = () => {
      if (!isMounted || reconnectTimeout) return;
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        connectRealtime();
      }, 2500);
    };

    async function connectRealtime() {
      if (!isLoaded || !isSignedIn || !isMounted) return;

      const token = await getFreshToken();

      if (!token || !isMounted) return;

      socket?.close();
      socket = new WebSocket(getRealtimeUrl(token));

      socket.onopen = () => {
        clearReconnect();
        refreshNotifications().catch(() => undefined);
      };

      socket.onmessage = event => {
        try {
          const payload = JSON.parse(event.data);

          if (
            payload.type === 'notification.created' ||
            payload.type === 'friend_request.created' ||
            payload.type === 'friendship.updated' ||
            payload.type === 'notifications.read_all'
          ) {
            setRealtimeVersion(current => current + 1);
            refreshNotifications().catch(() => undefined);
          }
        } catch {
          // Ignore invalid realtime messages.
        }
      };

      socket.onclose = scheduleReconnect;
      socket.onerror = scheduleReconnect;
    }

    connectRealtime();

    return () => {
      isMounted = false;
      clearReconnect();
      socket?.close();
    };
  }, [getFreshToken, isLoaded, isSignedIn, refreshNotifications]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, realtimeVersion, refreshNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
