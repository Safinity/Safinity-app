import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import users from '@/data/users.json';
import { userImages } from '../../assets/images/Users/userImages';
import auth from '@/data/auth.json';
import Header from '@/components/ui/header';
import FindFriendButton from '@/components/FindFriendButton';
import PingFriend from '@/components/VibrateButton';
import FriendActionButton from '@/components/FriendActionButton';

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
        <LoadingText accessibilityRole="text">Loading...</LoadingText>
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
      <Head>
        <title>Friends | Safinity</title>
      </Head>

      <Header variant="default" title="Friends" showBottomDivider={false} />

      <ScrollArea
        importantForAccessibility="yes"
        accessibilityLabel="Lista de amigos"
      >
        {/* Region: Friends Header */}
        <RegionContainer accessibilityRole="region" accessibilityLabel="Cabeçalho de amigos">
          <SectionTitle accessibilityRole="header" accessibilityLevel={1}>
            <Title>Friends</Title>
            <TouchableOpacity
              onPress={handleAddFriend}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add a new friend"
              accessibilityHint="Go to the add friend screen"
            >
              <Ionicons name="person-add-outline" size={24} color="white" />
            </TouchableOpacity>
          </SectionTitle>
        </RegionContainer>

        {/* Region: On the same event */}
        <RegionContainer accessibilityRole="region" accessibilityLabel="Amigos no mesmo evento">
          <SectionSubtitle accessibilityRole="header" accessibilityLevel={2}>
            On the same event
          </SectionSubtitle>
          {onSameEvent.map(friend => (
            <TouchableOpacity
              key={friend.id}
              onPress={() => router.push(`/friends/${friend.id}`)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${friend.name}, username ${friend.username}. Tap to view profile.`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              <Avatar
                source={userImages[friend.image]}
                accessibilityRole="image"
                accessibilityLabel={`Profile picture of ${friend.name}`}
              />
              <Info>
                <Name>{friend.name}</Name>
                <Username>@{friend.username}</Username>
              </Info>
              <Buttons>
                <PingFriend
                  onPress={() => console.log('Buzz amigo')}
                  accessibilityRole="button"
                  accessibilityLabel={`Buzz ${friend.name}`}
                  accessibilityHint={`Send a buzz to ${friend.name}`}
                />
                <FindFriendButton
                  onPress={() =>
                    router.push({ pathname: '/map', params: { focusId: friend.id } })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Locate ${friend.name} on the map`}
                  accessibilityHint="Shows the location of the friend on the map"
                />
              </Buttons>
            </TouchableOpacity>
          ))}
        </RegionContainer>

        {/* Region: Other Friends */}
        <RegionContainer accessibilityRole="region" accessibilityLabel="Other friends">
          <SectionSubtitle accessibilityRole="header" accessibilityLevel={2}>
            Other Friends
          </SectionSubtitle>
          {otherFriends.map(friend => (
            <TouchableOpacity
              key={friend.id}
              onPress={() => router.push(`/friends/${friend.id}`)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${friend.name}, username ${friend.username}. Tap to view profile.`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              <Avatar
                source={userImages[friend.image]}
                accessibilityRole="image"
                accessibilityLabel={`Profile picture of ${friend.name}`}
              />
              <Info>
                <Name>{friend.name}</Name>
                <Username>@{friend.username}</Username>
              </Info>
              <Buttons>
                <FriendActionButton
                  variant="remove"
                  onPress={() => removeFriend(friend.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${friend.name}`}
                  accessibilityHint="Remove this friend from your list"
                />
              </Buttons>
            </TouchableOpacity>
          ))}
        </RegionContainer>
      </ScrollArea>
    </Container>
  );
}

// ---------------------------------------------
// Styled Components
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

const RegionContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
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
  align-items: center;
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