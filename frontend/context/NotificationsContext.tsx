import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/expo';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Modal, Platform, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import api, { API_BASE } from '@/utils/api';

type NotificationsContextValue = {
  unreadCount: number;
  realtimeVersion: number;
  refreshNotifications: () => Promise<void>;
};

type FriendBuzzPayload = {
  senderId: string;
  senderName: string;
};

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadCount: 0,
  realtimeVersion: 0,
  refreshNotifications: async () => undefined,
});

function getRealtimeUrl(token: string) {
  return `${API_BASE.replace(/^http/, 'ws')}/notifications/realtime?token=${encodeURIComponent(token)}`;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getExpoProjectId() {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;

  return Constants.easConfig?.projectId ?? extra?.eas?.projectId;
}

function vibrateForFriendBuzz() {
  Vibration.vibrate([0, 260, 120, 260]);
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [realtimeVersion, setRealtimeVersion] = useState(0);
  const [activeBuzz, setActiveBuzz] = useState<FriendBuzzPayload | null>(null);
  const getTokenRef = useRef(getToken);
  const buzzIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  getTokenRef.current = getToken;

  const getFreshToken = useCallback(async () => {
    const getTokenWithOptions = getTokenRef.current as (
      options?: unknown,
    ) => Promise<string | null>;
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
    const notifications = Array.isArray(notificationsResponse.data)
      ? notificationsResponse.data
      : [];
    const pendingRequests = Array.isArray(pendingRequestsResponse.data)
      ? pendingRequestsResponse.data
      : [];
    const unreadNotifications = notifications.filter(notification => !notification.read).length;

    setUnreadCount(unreadNotifications + pendingRequests.length);
  }, [getFreshToken, isLoaded, isSignedIn]);

  const stopFriendBuzz = useCallback(() => {
    if (buzzIntervalRef.current) {
      clearInterval(buzzIntervalRef.current);
      buzzIntervalRef.current = null;
    }

    Vibration.cancel();
    setActiveBuzz(null);
  }, []);

  const startFriendBuzz = useCallback(
    (payload: FriendBuzzPayload) => {
      stopFriendBuzz();
      setActiveBuzz(payload);
      vibrateForFriendBuzz();
      buzzIntervalRef.current = setInterval(vibrateForFriendBuzz, 1100);
    },
    [stopFriendBuzz],
  );

  useEffect(() => {
    if (!isLoaded) return;

    refreshNotifications().catch(() => {
      setUnreadCount(0);
    });
  }, [isLoaded, refreshNotifications]);

  useEffect(() => {
    let isMounted = true;

    async function registerPushToken() {
      if (!isLoaded || !isSignedIn || Platform.OS === 'web') {
        return;
      }

      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('friend-buzz', {
            name: 'Friend buzz',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 260, 120, 260],
            enableVibrate: true,
            sound: 'default',
          });
        }

        const permission = await Notifications.getPermissionsAsync();
        const finalPermission =
          permission.status === 'granted'
            ? permission
            : await Notifications.requestPermissionsAsync();

        if (!isMounted || finalPermission.status !== 'granted') {
          return;
        }

        const projectId = getExpoProjectId();

        if (!projectId) {
          console.warn('[PUSH] Missing Expo project id for push token registration.');
          return;
        }

        const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
        const token = await getFreshToken();

        if (!isMounted || !token) {
          return;
        }

        await api.post(
          '/users/me/push-token',
          {
            token: pushToken.data,
            platform: Platform.OS,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch (error) {
        console.warn('[PUSH] Failed to register push token:', error);
      }
    }

    registerPushToken();

    return () => {
      isMounted = false;
    };
  }, [getFreshToken, isLoaded, isSignedIn]);

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

          if (payload.type === 'friend.buzz') {
            startFriendBuzz({
              senderId: typeof payload.senderId === 'string' ? payload.senderId : '',
              senderName: typeof payload.senderName === 'string' ? payload.senderName : 'A friend',
            });
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
  }, [getFreshToken, isLoaded, isSignedIn, refreshNotifications, startFriendBuzz]);

  useEffect(() => {
    return () => {
      if (buzzIntervalRef.current) {
        clearInterval(buzzIntervalRef.current);
      }

      Vibration.cancel();
    };
  }, []);

  return (
    <NotificationsContext.Provider value={{ unreadCount, realtimeVersion, refreshNotifications }}>
      {children}
      <Modal
        animationType="fade"
        transparent
        visible={Boolean(activeBuzz)}
        onRequestClose={stopFriendBuzz}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>{activeBuzz?.senderName ?? 'A friend'} is buzzing you</Text>
            <Text style={styles.message}>Your friend is trying to get your attention.</Text>
            <Pressable
              style={styles.button}
              onPress={stopFriendBuzz}
              accessibilityRole="button"
              accessibilityLabel="Stop vibration"
            >
              <Text style={styles.buttonText}>I'm here</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.grayNavbar,
  },
  title: {
    color: Colors.white,
    fontFamily: Fonts.weights.semibold,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    color: Colors.inactive,
    fontFamily: Fonts.weights.light,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.weights.medium,
    fontSize: 16,
  },
});
