import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { userImages } from '../assets/images/Users/userImages';
import users from '@/data/users.json';
import SearchBarQR from '@/components/SearchBarQR';
import FriendActionButton from '@/components/FriendActionButton';
import { TouchableOpacity, View } from 'react-native';
import Head from 'expo-router/head';

export default function AddFriendScreen() {
  const { currentUser, addFriend, removeFriend } = useUser();
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  if (!currentUser) return null;

  // ALTERAÇÃO: Função para garantir que volta para a página de amigos

  const handleBack = () => {
    router.push('/(tabs)/friends');
  };

  const handleSubmitSearch = () => {
    if (search.trim().length > 0) {
      setRecentSearches(prev => {
        const updated = [search, ...prev.filter(item => item !== search)];
        return updated.slice(0, 5);
      });
    }
  };

  const filteredUsers =
    search.length === 0
      ? []
      : users.filter(u => {
          const text = search.toLowerCase();
          return (
            u.id !== currentUser.id &&
            (u.name.toLowerCase().includes(text) || u.username.toLowerCase().includes(text))
          );
        });

  const isFriend = (id: string) => currentUser.friends.includes(id);

  return (
    <Container>
      <Head>
        <title>Add Friend | Safinity</title>
      </Head>
      <Stack.Screen options={{ title: 'Add Friend | Safinity', headerShown: false }} />
      <HeaderContainer>
        <BackButton
          onPress={handleBack}
          accessibilityLabel="Return to the previous page"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </BackButton>
        <Title>Add friend</Title>
      </HeaderContainer>

      <ScrollArea>
        <SearchBarQR
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSubmitSearch}
          onPressQR={() => router.push('/qrcode-scan')}
          placeholder="Find friends"
        />

        {search.length === 0 ? (
          <>
            <Subtitle>Recent searches</Subtitle>
            {recentSearches.length === 0 ? (
              <EmptyText>No recent searches</EmptyText>
            ) : (
              recentSearches.map(item => (
                <RecentItem
                  key={item}
                  onPress={() => setSearch(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Search again for ${item}`}
                >
                  <Ionicons name="time-outline" size={18} color="white" />
                  <RecentText>{item}</RecentText>
                </RecentItem>
              ))
            )}
          </>
        ) : (
          <>
            <Subtitle>Results</Subtitle>
            {filteredUsers.map(user => (
              <TouchableOpacity key={user.id} onPress={() => router.push(`/${user.id}`)}>
                <UserRow>
                  <Avatar
                    source={userImages[user.image]}
                    accessibilityLabel={`Profile picture of ${user.name}`}
                  />
                  <Info>
                    <Name>{user.name}</Name>
                    <Username>@{user.username}</Username>
                  </Info>
                  {isFriend(user.id) ? (
                    <FriendActionButton variant="remove" onPress={() => removeFriend(user.id)} />
                  ) : (
                    <FriendActionButton variant="add" onPress={() => addFriend(user.id)} />
                  )}
                </UserRow>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollArea>
    </Container>
  );
}

// ------------------------------------------------------ Styled Components ---------------------------------------------------

const HeaderContainer = styled.View`
  margin-bottom: 30px;
`;

const BackButton = styled.TouchableOpacity`
  margin-bottom: 20px;
  width: 40px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h1.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize}px;
  font-weight: bold;
`;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 60px 30px 20px;
`;

const ScrollArea = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  bounces: false,
  contentContainerStyle: {
    paddingTop: 20,
  },
})`
  flex: 1;
`;

const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  color: ${({ theme }) => theme.colors.palette.primary.light50};
  margin-top: 20px;
  margin-bottom: 16px;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
  font-size: 14px;
  margin-bottom: 20px;
`;

const RecentItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding-vertical: 10px;
`;

const RecentText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  margin-left: 10px;
`;

const UserRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const Avatar = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: 35px;
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
  font-weight: bold;
`;

const Username = styled.Text`
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.7;
`;
