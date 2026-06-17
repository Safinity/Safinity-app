import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import Header from '../../components/ui/header';
import { userImages } from '../../assets/images/Users/userImages';
import { Stack } from 'expo-router';
import { useNotifications } from '@/context/NotificationsContext';
import api, { API_BASE } from '../../utils/api';

type NotificationItem = {
  id: string;
  type: string;
  title: string | null;
  message: string | null;
  description?: string | null;
  time: string | null;
  read: boolean;
  avatar?: keyof typeof userImages;
  imageUri?: string;
  senderId?: string;
  friendshipId?: string;
  isDivider?: boolean;
};

function getRealtimeUrl(token: string) {
  return `${API_BASE.replace(/^http/, 'ws')}/notifications/realtime?token=${encodeURIComponent(token)}`;
}

function formatNotificationTime(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  }) + `, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PageHeaderContent = styled.View`
  padding: ${({ theme }) => theme.spacing.xxxl}px ${({ theme }) => theme.spacing.margemLateral}px
    ${({ theme }) => theme.spacing.md}px;
`;

const MarkReadButton = styled.Pressable`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.borderRadius.small}px;
  align-self: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

const MarkReadText = styled.Text`
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
`;

const NotificationCard = styled.View<{ $isNew: boolean }>`
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.margemLateral}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ $isNew }) => ($isNew ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
  align-items: center;
`;

const Avatar = styled.Image`
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: ${({ theme }) => theme.colors.neutralGray};
`;

const IconCircle = styled.View`
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: ${({ theme }) => theme.colors.white};
  justify-content: center;
  align-items: center;
`;

const CardContent = styled.View`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const CardTitle = styled.Text`
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
`;

const CardTime = styled.Text`
  font-family: ${({ theme }) => theme.text.label.fontFamily};
  font-size: ${({ theme }) => theme.text.label.fontSize}px;
  color: #c4c4c8;
`;

const CardMessage = styled.Text`
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }) => theme.text.corpo.corpoTexto.lineHeight}px;
  color: ${({ theme }) => theme.colors.palette.neutral.neutral80};
`;

const ActionRow = styled.View`
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const AcceptButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  flex: 1;
  height: ${({ theme }) => theme.height.tam_42}px;
  border-radius: ${({ theme }) => theme.borderRadius.small}px;
  justify-content: center;
  align-items: center;
`;

const RemoveButton = styled.TouchableOpacity`
  background-color: rgba(146, 66, 204, 0.15);
  flex: 1;
  height: ${({ theme }) => theme.height.tam_42}px;
  border-radius: ${({ theme }) => theme.borderRadius.small}px;
  justify-content: center;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

const SectionLabel = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light50};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  margin: 0px ${({ theme }) => theme.spacing.margemLateral}px ${({ theme }) => theme.spacing.sm}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ErrorText = styled.Text`
  color: #f67f7f;
  font-size: 16px;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { refreshNotifications } = useNotifications();
  const getTokenRef = useRef(getToken);

  getTokenRef.current = getToken;

  const getFreshToken = useCallback(async () => {
    const getTokenWithOptions = getTokenRef.current as (options?: unknown) => Promise<string | null>;
    return getTokenWithOptions({ skipCache: true });
  }, []);

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (!isSignedIn) {
      setNotifications([]);
      setLoading(false);
      setError('Please sign in to view notifications.');
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const token = await getFreshToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const [notificationsResponse, pendingRequestsResponse] = await Promise.all([
        api.get('/notifications/me', { headers }),
        api.get('/friends/requests/pending', { headers }),
      ]);
      const eventNotifications = Array.isArray(notificationsResponse.data)
        ? notificationsResponse.data
        : [];
      const pendingRequests = Array.isArray(pendingRequestsResponse.data)
        ? pendingRequestsResponse.data.map(request => ({
            id: `friend-${request.id}`,
            friendshipId: request.id,
            senderId: request.sender?.id,
            title: 'Friendship request',
            message: request.sender?.username ? `@${request.sender.username}` : request.sender?.name,
            description: request.sender?.username ? `@${request.sender.username}` : request.sender?.name,
            type: 'friend',
            category: 'friend',
            time: null,
            read: false,
            imageUri: request.sender?.image
              ? `data:image/jpeg;base64,${request.sender.image}`
              : undefined,
          }))
        : [];

      setNotifications([...pendingRequests, ...eventNotifications]);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [getFreshToken, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    fetchNotifications(true);
  }, [fetchNotifications, isLoaded]);

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
      if (!isLoaded || !isSignedIn) {
        return;
      }

      const token = await getFreshToken();

      if (!token || !isMounted) {
        return;
      }

      socket?.close();
      socket = new WebSocket(getRealtimeUrl(token));

      socket.onopen = () => {
        clearReconnect();
      };

      socket.onmessage = event => {
        try {
          const payload = JSON.parse(event.data);

          if (
            payload.type === 'notification.created' ||
            payload.type === 'friend_request.created' ||
            payload.type === 'friendship.updated'
          ) {
            fetchNotifications(false);
            refreshNotifications().catch(() => undefined);
          }

          if (payload.type === 'notifications.read_all') {
            setNotifications(currentNotifications =>
              currentNotifications.map(notification => ({ ...notification, read: true })),
            );
            refreshNotifications().catch(() => undefined);
          }
        } catch {
          // Ignore invalid realtime messages.
        }
      };

      socket.onclose = scheduleReconnect;
      socket.onerror = scheduleReconnect;
    }

    connectRealtime().catch(scheduleReconnect);

    return () => {
      isMounted = false;
      clearReconnect();
      socket?.close();
    };
  }, [fetchNotifications, getFreshToken, isLoaded, isSignedIn, refreshNotifications]);

  const newNotifications = notifications.filter(n => !n.read);
  const oldNotifications = notifications.filter(n => n.read);

  const dataToRender = [
    ...newNotifications,
    ...(oldNotifications.length > 0 ? [{ id: 'divider', isDivider: true }] : []),
    ...oldNotifications,
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'sos':
        return <Ionicons name="alert-circle" size={32} color="#D34A4A" />;
      case 'emergency':
        return <Ionicons name="alert-circle" size={32} color="#D34A4A" />;
      case 'activity':
        return <Ionicons name="notifications" size={30} color="#9242CC" />;
      case 'crowd':
        return <Ionicons name="people" size={30} color="#9242CC" />;
      case 'hydrate':
        return <Ionicons name="water" size={30} color="#9242CC" />;
      case 'security':
        return <Ionicons name="shield-checkmark" size={30} color="#9242CC" />;
      default:
        return <Ionicons name="mail" size={30} color="#9242CC" />;
    }
  };

  const getIconLabel = (type: string) => {
    switch (type) {
      case 'sos':
        return 'Friend SOS alert';
      case 'emergency':
        return 'Emergency alert';
      case 'activity':
        return 'Activity notification';
      case 'crowd':
        return 'Crowd alert';
      case 'hydrate':
        return 'Hydration reminder';
      case 'security':
        return 'Security alert';
      default:
        return 'Notification';
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = await getFreshToken();
      await api.patch('/notifications/me/read-all', undefined, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setNotifications(currentNotifications =>
        currentNotifications.map(notification => ({ ...notification, read: true })),
      );
      await refreshNotifications();
    } catch (markReadError: any) {
      setError(markReadError.response?.data?.message || 'Unable to mark notifications as read');
    }
  };

  const handleFriendRequest = async (item: NotificationItem, action: 'accept' | 'remove') => {
    if (!item.senderId) {
      return;
    }

    try {
      const token = await getFreshToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const endpoint =
        action === 'accept' ? `/friends/accept/${item.senderId}` : `/friends/toggle/${item.senderId}`;

      await api.post(endpoint, undefined, { headers });
      await fetchNotifications(false);
      await refreshNotifications();
    } catch (friendRequestError: any) {
      setError(friendRequestError.response?.data?.message || 'Unable to update friend request');
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    if (item.isDivider) return <SectionLabel>Oldest</SectionLabel>;

    const notificationTime = formatNotificationTime(item.time);
    const notificationMessage = item.message || item.description || '';
    const notificationTitle = item.title || 'Notification';
    const friendAvatarSource = item.imageUri
      ? { uri: item.imageUri }
      : item.avatar
        ? userImages[item.avatar]
        : null;
    const cardLabel = `${notificationTitle}, ${notificationTime}. ${notificationMessage}${item.read ? '' : ', new notification'}`;

    return (
      <NotificationCard
        $isNew={!item.read}
        accessible={true}
        role="none"
        accessibilityLabel={cardLabel}
      >
        {item.type === 'friend' && friendAvatarSource ? (
          <Avatar
            source={friendAvatarSource}
            accessibilityLabel={`Profile picture of ${notificationTitle}`}
          />
        ) : (
          <IconCircle
            accessible={true}
            accessibilityLabel={getIconLabel(item.type)}
            importantForAccessibility="yes"
          >
            {getIcon(item.type)}
          </IconCircle>
        )}

        <CardContent>
          <CardHeader>
            <CardTitle
              style={item.type === 'emergency' || item.type === 'sos' ? { color: '#f67f7f' } : undefined}
            >
              {notificationTitle}
            </CardTitle>
            <CardTime>{notificationTime}</CardTime>
          </CardHeader>
          <CardMessage>{notificationMessage}</CardMessage>

          {item.type === 'friend' && (
            <ActionRow>
              <RemoveButton
                onPress={() => handleFriendRequest(item, 'remove')}
                role="button"
                accessibilityLabel={`Remove friend request from ${notificationTitle}`}
              >
                <MarkReadText style={{ color: '#E8CAFF' }}>Remove</MarkReadText>
              </RemoveButton>
              <AcceptButton
                onPress={() => handleFriendRequest(item, 'accept')}
                role="button"
                accessibilityLabel={`Accept friend request from ${notificationTitle}`}
              >
                <MarkReadText>Accept</MarkReadText>
              </AcceptButton>
            </ActionRow>
          )}
        </CardContent>
      </NotificationCard>
    );
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Notifications' }} />

      {loading ? (
        <LoadingContainer>
          <ActivityIndicator size="large" color="#9242CC" />
        </LoadingContainer>
      ) : (
        <>
          {/* Header fixo no topo */}
          <Header
            variant="back"
            title="Notifications"
            subtitle={`You have ${newNotifications.length} new notifications.`}
          />

          {error && <ErrorText>{error}</ErrorText>}

          {/* Botão Mark all read abaixo do header */}
          <PageHeaderContent>
            <MarkReadButton
              onPress={handleMarkAllRead}
              role="button"
              accessibilityLabel="Mark all notifications as read"
            >
              <MarkReadText>Mark all as read</MarkReadText>
            </MarkReadButton>
          </PageHeaderContent>

          {/* Lista apenas com notificações */}
          <FlatList
            data={dataToRender}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            role="list"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 50,
              paddingHorizontal: 0, // já temos o padding no PageHeaderContent ou no container
            }}
          />
        </>
      )}
    </Container>
  );
}