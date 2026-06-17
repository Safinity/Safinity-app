import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { useRouter, Stack } from 'expo-router';
import { userImages } from '../assets/images/Users/userImages';
import SearchBarQR from '@/components/SearchBarQR';
import FriendActionButton from '@/components/FriendActionButton';
import { ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import Head from 'expo-router/head';
import Header from '@/components/ui/header';
import { useAuth } from '@clerk/expo';
import { getFriends, searchUsers, toggleFriendship, type FriendSearchItem } from '@/utils/friends';
import { Ionicons } from '@expo/vector-icons';

function getAvatarSource(user: FriendSearchItem) {
  if (user.image) {
    return { uri: `data:image/jpeg;base64,${user.image}` };
  }

  return userImages.default;
}

export default function AddFriendScreen() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<FriendSearchItem[]>([]);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState('');
  const router = useRouter();
  const trimmedSearch = search.trim();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    let isActive = true;

    async function loadFriends() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setFriendIds([]);
        setIsLoadingFriends(false);
        return;
      }

      try {
        setIsLoadingFriends(true);
        const token = await getTokenRef.current();
        const friends = await getFriends(token);
        const ids = [...friends.onSameEvent, ...friends.otherFriends].map(friend => friend.id);

        if (isActive) {
          setFriendIds(ids);
        }
      } catch (error) {
        console.error('Failed to load friends for search', error);
      } finally {
        if (isActive) {
          setIsLoadingFriends(false);
        }
      }
    }

    loadFriends();

    return () => {
      isActive = false;
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    let isActive = true;

    if (!isLoaded || !isSignedIn || trimmedSearch.length === 0) {
      setResults([]);
      setIsSearching(false);
      setSearchError('');
      return () => {
        isActive = false;
      };
    }

    setIsSearching(true);
    setSearchError('');

    const timeoutId = setTimeout(async () => {
      try {
        const token = await getTokenRef.current();
        const users = await searchUsers(token, trimmedSearch);

        if (isActive) {
          setResults(users);
          setSearchError('');
        }
      } catch (error) {
        console.error('Failed to search users', error);
        if (isActive) {
          setResults([]);
          setSearchError('Unable to search users.');
        }
      } finally {
        if (isActive) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [isLoaded, isSignedIn, trimmedSearch]);

  const friendIdSet = useMemo(() => new Set(friendIds), [friendIds]);

  const handleSubmitSearch = () => {
    if (trimmedSearch.length > 0) {
      setRecentSearches(prev => {
        const updated = [trimmedSearch, ...prev.filter(item => item !== trimmedSearch)];
        return updated.slice(0, 5);
      });
    }
  };

  const isFriend = (id: string) => friendIdSet.has(id);

  const removeRecentSearch = (item: string) => {
    setRecentSearches(prev => prev.filter(searchItem => searchItem !== item));
  };

  const handleToggleFriend = async (user: FriendSearchItem) => {
    try {
      setTogglingUserId(user.id);
      const token = await getTokenRef.current();
      await toggleFriendship(token, user.id);

      setFriendIds(prev =>
        prev.includes(user.id) ? prev.filter(friendId => friendId !== user.id) : [...prev, user.id],
      );
    } catch (error) {
      console.error('Failed to toggle friendship', error);
      Alert.alert('Unable to update friend', 'Please try again.');
    } finally {
      setTogglingUserId(null);
    }
  };

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

        {!isLoaded || isLoadingFriends ? (
          <LoadingArea>
            <ActivityIndicator color="white" />
          </LoadingArea>
        ) : null}

        {trimmedSearch.length === 0 ? (
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
                  <RemoveRecentButton
                    onPress={event => {
                      event.stopPropagation();
                      removeRecentSearch(item);
                    }}
                    role="button"
                    accessibilityLabel={`Remove recent search ${item}`}
                  >
                    <Ionicons name="close" size={22} color="white" />
                  </RemoveRecentButton>
                </RecentItem>
              ))
            )}
          </>
        ) : (
          <>
            <Subtitle role="header" accessibilityLevel={2}>
              Results
            </Subtitle>

            {isSearching ? (
              <LoadingArea>
                <ActivityIndicator color="white" />
              </LoadingArea>
            ) : null}

            {!isSearching && results.length === 0 ? (
              <EmptyText>{searchError || 'No users found'}</EmptyText>
            ) : null}

            {results.map(user => (
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
                  source={getAvatarSource(user)}
                  role="image"
                  accessibilityLabel={`Profile picture of ${user.name}`}
                />

                <Info>
                  <Name>{user.name || 'Safinity user'}</Name>

                  <Username>@{user.username || 'user'}</Username>
                </Info>

                {isFriend(user.id) ? (
                  <FriendActionButton
                    variant="remove"
                    onPress={() => handleToggleFriend(user)}
                    disabled={togglingUserId === user.id}
                    role="button"
                    accessibilityLabel={`Remove ${user.name} from friends`}
                    accessibilityHint="Removes this user from your friend list"
                  />
                ) : (
                  <FriendActionButton
                    variant="add"
                    onPress={() => handleToggleFriend(user)}
                    disabled={togglingUserId === user.id}
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

const LoadingArea = styled.View`
  align-items: center;
  justify-content: center;
  padding-vertical: 20px;
`;

const RecentItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 10px;
`;

const RecentText = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
`;

const RemoveRecentButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
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
