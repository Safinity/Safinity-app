import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import users from '@/data/users.json';
import { userImages } from '../../assets/images/Users/userImages';
import auth from '@/data/auth.json';
import Header from '@/components/ui/header';
import FindFriendButton from '@/components/FindFriendButton';
import PingFriend from '@/components/VibrateButton';
import RemoveFriend from '@/components/FriendActionButton';

export default function FriendsScreen() {
  // Estado que guarda o utilizador autenticado
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Carrega o utilizador atual com base no ID guardado no auth.json
  useEffect(() => {
    const currentId = auth.currentUserId;
    const foundUser = users.find(u => u.id === currentId);
    setCurrentUser(foundUser);
  }, []);

  // Enquanto os dados do utilizador não estiverem carregados, mostra um loading simples
  if (!currentUser) {
    return (
      <Container>
        <LoadingText>Loading...</LoadingText>
      </Container>
    );
  }

  // IDs dos amigos do utilizador atual
  const friendIds = currentUser.friends;
  const friends = users.filter(u => friendIds.includes(u.id));
  const onSameEvent = friends.filter(f => f.currentEventId === currentUser.currentEventId);
  const otherFriends = friends.filter(f => f.currentEventId !== currentUser.currentEventId);

  const removeFriend = (friendId: string) => {
    setCurrentUser((prev: any) => ({
      ...prev,
      friends: prev.friends.filter((id: string) => id !== friendId),
    }));
  };

  const handleAddFriend = () => router.push('/addfriend');

  return (
    <Container>
      <Header variant="default" title="Friends" showBottomDivider={false} />

      <ScrollArea>
        <SectionTitle>
          <Title>Friends</Title>
          <TouchableOpacity onPress={handleAddFriend}>
            <Ionicons name="person-add-outline" size={24} color="white" />
          </TouchableOpacity>
        </SectionTitle>

        <SectionSubtitle>On the same event</SectionSubtitle>
        {onSameEvent.map(friend => (
          <TouchableOpacity
            key={friend.id}
            onPress={() => router.push(`/friends/${friend.id}`)} // Navigate to friend profile
          >
            <FriendRow>
              <Avatar source={userImages[friend.image]} />
              <Info>
                <Name>{friend.name}</Name>
                <Username>@{friend.username}</Username>
              </Info>
              <Buttons>
                <PingFriend onPress={() => console.log('Vibrar amigo')} />
                <FindFriendButton
                  onPress={() =>
                    router.push({
                      pathname: '/map',
                      params: { focusId: friend.id },
                    })
                  }
                />
              </Buttons>
            </FriendRow>
          </TouchableOpacity>
        ))}

        <SectionSubtitle>Other Friends</SectionSubtitle>
        {otherFriends.map(friend => (
          <TouchableOpacity
            key={friend.id}
            onPress={() => router.push(`/friends/${friend.id}`)} // Navigate to friend profile
          >
            <FriendRow>
              <Avatar source={userImages[friend.image]} />
              <Info>
                <Name>{friend.name}</Name>
                <Username>@{friend.username}</Username>
              </Info>
              <Buttons>
                <RemoveFriend onPress={() => removeFriend(friend.id)} />
              </Buttons>
            </FriendRow>
          </TouchableOpacity>
        ))}
      </ScrollArea>
    </Container>
  );
}

/* ----------------------------- styled components ----------------------------- */

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
`;

const ScrollArea = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  bounces: false,
  contentContainerStyle: {
    paddingTop: 80,
  },
})`
  flex: 1;
`;

const LoadingText = styled.Text`
  margin-top: 50px;
  text-align: center;
  font-size: 16px;
`;

const SectionTitle = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 16px;
`;

const SectionSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light50};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  margin-bottom: 16px;
`;

const FriendRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const Avatar = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: #ccc;
`;

const Info = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const Name = styled.Text`
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
`;

const Username = styled.Text`
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  color: ${({ theme }) => theme.colors.white};
  padding-right: 4px;
`;

const Buttons = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 6px;
  padding-left: 2px;
`;
