import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useUser } from '@/context/UserContext';
import users from '@/data/users.json';
import Header from '@/components/ui/header';
import SearchBarQR from '@/components/SearchBarQR';
import FriendActionButton from '@/components/FriendActionButton';
import { TouchableOpacity } from 'react-native';

export default function AddFriendScreen() {
  const { currentUser, addFriend, removeFriend } = useUser();
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  if (!currentUser) {
    return (
      <Container>
        <LoadingText>Loading...</LoadingText>
      </Container>
    );
  }

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
          const matches =
            u.name.toLowerCase().includes(text) || u.username.toLowerCase().includes(text);

          return u.id !== currentUser.id && matches;
        });

  const isFriend = (id: string) => currentUser.friends.includes(id);

  return (
    <Container>
      <Header variant="back" title="Add friend" showBottomDivider={false} />

      <ScrollArea>
        <SearchBarQR
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSubmitSearch}
          onPressQR={() => router.push('/qrcode')}
          placeholder="Find friends"
        />
        {search.length === 0 ? (
          <>
            <Subtitle>Recent searches</Subtitle>

            {recentSearches.length === 0 ? (
              <EmptyText>No recent searches</EmptyText>
            ) : (
              recentSearches.map((item, index) => (
                <RecentItem key={item} onPress={() => setSearch(item)}>
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
                  <Avatar source={{ uri: user.image }} />
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

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.margemLateral}px;
  padding-top: 80px;
`;

const LoadingText = styled.Text`
  margin-top: 50px;
  text-align: center;
  color: ${({ theme }) => theme.colors.white};
`;

const ScrollArea = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  bounces: false,
  contentContainerStyle: {
    paddingTop: 50,
  },
})`
  flex: 1;
`;

const Subtitle = styled.Text`
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  color: ${({ theme }) => theme.colors.palette.primary.light50};
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
`;
