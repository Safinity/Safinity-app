import React, { useState } from 'react';
import styled from 'styled-components/native';
import { useRouter, Stack } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { userImages } from '../assets/images/Users/userImages';
import users from '@/data/users.json';
import SearchBarQR from '@/components/SearchBarQR';
import FriendActionButton from '@/components/FriendActionButton';
import { TouchableOpacity } from 'react-native';
import Head from 'expo-router/head';
import Header from '@/components/ui/header';

export default function AddFriendScreen() {
  const { currentUser, addFriend, removeFriend } = useUser();
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  if (!currentUser) return null;

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

      <Stack.Screen
        options={{
          title: 'Add Friend | Safinity',
          headerShown: false,
        }}
      />

      {/* Global Header */}
      <Header variant="back" title="Add Friend" />

      {/* Main content */}
      <MainContent role="main" accessibilityLabel="Search and add friends">
        <SearchBarQR
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSubmitSearch}
          onPressQR={() => router.push('/qrcode-scan')}
          placeholder="Find friends"
          accessibilityLabel="Search friends by name or username"
        />

        {search.length === 0 ? (
          <>
            <Subtitle role="header" accessibilityLevel={2}>
              Recent searches
            </Subtitle>

            {recentSearches.length === 0 ? (
              <EmptyText>No recent searches</EmptyText>
            ) : (
              recentSearches.map(item => (
                <RecentItem
                  key={item}
                  onPress={() => setSearch(item)}
                  role="button"
                  accessibilityLabel={`Search again for ${item}`}
                >
                  <RecentText>{item}</RecentText>
                </RecentItem>
              ))
            )}
          </>
        ) : (
          <>
            <Subtitle role="header" accessibilityLevel={2}>
              Results
            </Subtitle>

            {filteredUsers.map(user => (
              <TouchableOpacity
                key={user.id}
                onPress={() => router.push(`/friends/${user.id}`)}
                accessible={true}
                role="button"
                accessibilityLabel={`Open profile of ${user.name}`}
                accessibilityHint="Tap to view this friend's profile"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Avatar
                  source={userImages[user.image]}
                  role="image"
                  accessibilityLabel={`Profile picture of ${user.name}`}
                />

                <Info>
                  <Name>{user.name}</Name>

                  <Username>@{user.username}</Username>
                </Info>

                {isFriend(user.id) ? (
                  <FriendActionButton
                    variant="remove"
                    onPress={() => removeFriend(user.id)}
                    role="button"
                    accessibilityLabel={`Remove ${user.name} from friends`}
                    accessibilityHint="Removes this user from your friend list"
                  />
                ) : (
                  <FriendActionButton
                    variant="add"
                    onPress={() => addFriend(user.id)}
                    role="button"
                    accessibilityLabel={`Add ${user.name} as a friend`}
                    accessibilityHint="Adds this user to your friend list"
                  />
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </MainContent>
    </Container>
  );
}

/* ---------------- styled components ---------------- */

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 120px 30px 20px;
`;

const MainContent = styled.ScrollView.attrs({
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
  margin-top: 20px;
  margin-bottom: 16px;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.6;
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
