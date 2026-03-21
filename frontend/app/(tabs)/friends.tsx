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
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const currentId = auth.currentUserId;
    const foundUser = users.find(u => u.id === currentId);
    setCurrentUser(foundUser);
  }, []);

  if (!currentUser) {
    return (
      <Container>
        <LoadingText>Loading...</LoadingText>
      </Container>
    );
  }

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
          <TouchableOpacity key={friend.id} onPress={() => router.push(`/friends/${friend.id}`)}>
            <FriendRow>
              <Avatar
                source={userImages[friend.image]}
                accessibilityLabel={`Profile picture of ${friend.name}`}
              />
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
          <TouchableOpacity key={friend.id} onPress={() => router.push(`/friends/${friend.id}`)}>
            <FriendRow>
              <Avatar
                source={userImages[friend.image]}
                accessibilityLabel={`Profile picture of ${friend.name}`}
              />
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

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
`;

const ScrollArea = styled.ScrollView.attrs(({ theme }) => ({
  showsVerticalScrollIndicator: false,
  bounces: false,
  contentContainerStyle: {
    paddingTop: theme.height.md,
    paddingBottom: theme.height.md,
  },
}))`
  flex: 1;
`;

const LoadingText = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  text-align: center;
  font-size: ${({ theme }) => theme.fonts.sizes.base}px;
  color: ${({ theme }) => theme.colors.white};
`;

const SectionTitle = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light50};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const FriendRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Avatar = styled.Image`
  width: ${({ theme }) => theme.height.sm}px;
  height: ${({ theme }) => theme.height.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  background-color: ${({ theme }) => theme.colors.neutralGray};
`;

const Info = styled.View`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
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
  padding-right: ${({ theme }) => theme.spacing.xs}px;
`;

const Buttons = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding-left: ${({ theme }) => theme.spacing.xxs}px;
`;
