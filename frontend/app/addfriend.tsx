import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { userImages } from '../assets/images/Users/userImages';
import users from '@/data/users.json';
import SearchBarQR from '@/components/SearchBarQR';
import FriendActionButton from '@/components/FriendActionButton';
import { TouchableOpacity } from 'react-native';
import Head from 'expo-router/head';

export default function AddFriendScreen() {
  const { currentUser, addFriend, removeFriend } = useUser();
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  if (!currentUser) return null;

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

      {/* Banner/Header */}
      <HeaderContainer accessibilityRole="banner">
        <BackButton
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Return to the previous page"
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </BackButton>
        <Title accessibilityRole="header" accessibilityLevel={1}>
          Add Friend
        </Title>
      </HeaderContainer>

      {/* Main content */}
      <MainContent accessibilityRole="main" accessibilityLabel="Search and add friends">
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
            <Subtitle accessibilityRole="header" accessibilityLevel={2}>
              Recent searches
            </Subtitle>
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
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color="white"
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                  <RecentText>{item}</RecentText>
                </RecentItem>
              ))
            )}
          </>
        ) : (
          <>
            <Subtitle accessibilityRole="header" accessibilityLevel={2}>
              Results
            </Subtitle>
            {filteredUsers.map(user => (
              <TouchableOpacity
                key={user.id}
                onPress={() => router.push(`/friends/${user.id}`)} // vai para o perfil do amigo
                accessible={true}
                accessibilityRole="button"
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
                  accessibilityRole="image"
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
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${user.name} from friends`}
                    accessibilityHint="Removes this user from your friend list"
                  />
                ) : (
                  <FriendActionButton
                    variant="add"
                    onPress={() => addFriend(user.id)}
                    accessibilityRole="button"
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

// ------------------------------------------------------ Styled Components ---------------------------------------------------

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 60px 30px 20px;
`;

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

const MainContent = styled.ScrollView.attrs({
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
  margin-left: 10px;
`;

const Avatar = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: 35px;
  background-color: #ccc;
`;

const UserRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
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
