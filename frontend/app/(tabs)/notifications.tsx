import React, { useState } from 'react';
import { FlatList, Image } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

import Header from '@/components/ui/header';
import { userImages } from '../../assets/images/Users/userImages';
import { Colors, Spacing, TextStyles, BorderRadius } from '../../constants/theme';
import initialData from '../../data/notifications.json';

// --- Styled Components ---

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const PageHeaderContent = styled.View`
  padding: ${Spacing.xxl}px ${Spacing.margemLateral}px ${Spacing.lg}px;
`;

const Title = styled.Text`
  font-family: ${TextStyles.titulo.h.fontFamily};
  font-size: 24px;
  color: ${Colors.white};
  margin-bottom: 8px;
`;

const CountText = styled.Text`
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: ${TextStyles.corpo.corpoTexto.fontSize}px;
  color: ${Colors.white};
`;

const BoldCount = styled.Text`
  font-family: ${TextStyles.titulo.h3.fontFamily};
  font-weight: bold;
`;

const MarkReadButton = styled.Pressable`
  background-color: ${Colors.primary};
  padding: 10px 20px;
  border-radius: ${BorderRadius.medium}px;
  align-self: flex-end;
  margin-top: 16px;
`;

const MarkReadText = styled.Text`
  font-family: ${TextStyles.botao.fontFamily};
  font-size: ${TextStyles.botao.fontSize}px;
  color: ${Colors.white};
`;

const NotificationCard = styled.View<{ $isNew: boolean }>`
  flex-direction: row;
  padding: 18px ${Spacing.margemLateral}px;
  margin-bottom: 8px;
  background-color: ${props => (props.$isNew ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
`;

const Avatar = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: ${BorderRadius.round}px;
  background-color: #ccc;
`;

const IconCircle = styled.View`
  width: 70px;
  height: 70px;
  border-radius: ${BorderRadius.round}px;
  background-color: ${Colors.white};
  justify-content: center;
  align-items: center;
`;

const CardContent = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const CardTitle = styled.Text`
  font-family: ${TextStyles.titulo.h3.fontFamily};
  font-size: ${TextStyles.titulo.h3.fontSize}px;
  color: ${Colors.white};
`;

const CardTime = styled.Text`
  font-family: ${TextStyles.label.fontFamily};
  font-size: ${TextStyles.label.fontSize}px;
  color: ${Colors.inactive};
`;

const CardMessage = styled.Text`
  font-family: ${TextStyles.corpo.corpoTexto.fontFamily};
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.palette.neutral.neutral80};
`;

const ActionRow = styled.View`
  flex-direction: row;
  margin-top: 12px;
  gap: 12px;
`;

const AcceptButton = styled.TouchableOpacity`
  background-color: ${Colors.primary};
  flex: 1;
  height: 40px;
  border-radius: ${BorderRadius.small}px;
  justify-content: center;
  align-items: center;
`;

const RemoveButton = styled.TouchableOpacity`
  background-color: rgba(146, 66, 204, 0.15);
  flex: 1;
  height: 40px;
  border-radius: ${BorderRadius.small}px;
  justify-content: center;
  align-items: center;
`;

const SectionLabel = styled.Text`
  color: ${Colors.palette.primary.light50};
  font-size: ${TextStyles.titulo.h3.fontSize}px;
  font-family: ${TextStyles.titulo.h3.fontFamily};
  margin: 20px ${Spacing.margemLateral}px 10px;
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
        return <Ionicons name="alert-circle" size={32} color={Colors.palette.error.normal} />;
      case 'activity':
        return <Ionicons name="notifications" size={30} color={Colors.primary} />;
      case 'crowd':
        return <Ionicons name="people" size={30} color={Colors.primary} />;
      case 'hydrate':
        return <Ionicons name="water" size={30} color={Colors.primary} />;
      case 'security':
        return <Ionicons name="shield-checkmark" size={30} color={Colors.primary} />;
      default:
        return <Ionicons name="mail" size={30} color={Colors.primary} />;
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.isDivider) return <SectionLabel>Oldest</SectionLabel>;

    return (
      <NotificationCard $isNew={!item.read}>
        {item.type === 'friend' ? (
          <Avatar source={userImages[item.avatar]} />
        ) : (
          <IconCircle>{getIcon(item.type)}</IconCircle>
        )}

        <CardContent>
          <CardHeader>
            <CardTitle
              style={item.type === 'emergency' ? { color: Colors.palette.error.normal } : null}
            >
              {item.title}
            </CardTitle>
            <CardTime>{item.time}</CardTime>
          </CardHeader>
          <CardMessage>{item.message}</CardMessage>

          {item.type === 'friend' && (
            <ActionRow>
              <RemoveButton>
                <MarkReadText style={{ color: Colors.primary_50 }}>Remove</MarkReadText>
              </RemoveButton>
              <AcceptButton>
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
      <Header variant="back" />
      <FlatList
        data={dataToRender}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={
          <PageHeaderContent>
            <Title>Notifications</Title>
            <CountText>
              You have <BoldCount>{newNotifications.length}</BoldCount> new notifications.
            </CountText>
            <MarkReadButton onPress={handleMarkAllRead}>
              <MarkReadText>Mark all as read</MarkReadText>
            </MarkReadButton>
          </PageHeaderContent>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </Container>
  );
}
