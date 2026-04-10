import React, { useState } from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/ui/header';
import { userImages } from '../../assets/images/Users/userImages';
import initialData from '../../data/notifications.json';
import { Stack } from 'expo-router';

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialData);

  const newNotifications = notifications.filter(n => !n.read);
  const oldNotifications = notifications.filter(n => n.read);

  const dataToRender = [
    ...newNotifications,
    ...(oldNotifications.length > 0 ? [{ id: 'divider', isDivider: true }] : []),
    ...oldNotifications,
  ];

  const getIcon = (type: string) => {
    switch (type) {
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

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.isDivider) return <SectionLabel role="header">Oldest</SectionLabel>;

    const cardLabel = `${item.title}, ${item.time}. ${item.message}${item.read ? '' : ', new notification'}`;

    return (
      <NotificationCard
        $isNew={!item.read}
        accessible={true}
        role="none"
        accessibilityLabel={cardLabel}
      >
        {item.type === 'friend' ? (
          <Avatar
            source={userImages[item.avatar]}
            accessibilityLabel={`Profile picture of ${item.title}`}
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
            <CardTitle style={item.type === 'emergency' ? { color: '#f67f7f' } : undefined}>
              {item.title}
            </CardTitle>
            <CardTime>{item.time}</CardTime>
          </CardHeader>
          <CardMessage>{item.message}</CardMessage>

          {item.type === 'friend' && (
            <ActionRow>
              <RemoveButton
                role="button"
                accessibilityLabel={`Remove friend request from ${item.title}`}
              >
                <MarkReadText style={{ color: '#E8CAFF' }}>Remove</MarkReadText>
              </RemoveButton>
              <AcceptButton
                role="button"
                accessibilityLabel={`Accept friend request from ${item.title}`}
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

      {/* Header fixo no topo */}
      <Header
        variant="back"
        title="Notifications"
        subtitle={`You have ${newNotifications.length} new notifications.`}
      />

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
    </Container>
  );
}
