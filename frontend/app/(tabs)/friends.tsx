import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { isAxiosError } from 'axios';
import { userImages } from '../../assets/images/Users/userImages';
import Header from '@/components/ui/header';
import FindFriendButton from '@/components/FindFriendButton';
import PingFriend from '@/components/VibrateButton';
import FriendActionButton from '@/components/FriendActionButton';
import { useAuth } from '@clerk/expo';
import {
  getFriends,
  toggleFriendship,
  type FriendListItem,
  type FriendsGroupedResponse,
} from '@/utils/friends';

const emptyFriends: FriendsGroupedResponse = {
  onSameEvent: [],
  otherFriends: [],
};

function getAvatarSource(friend: FriendListItem) {
  if (friend.image) {
    return { uri: `data:image/jpeg;base64,${friend.image}` };
  }

  return userImages.default;
}

function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status) {
      return `Request failed with status ${error.response.status}.`;
    }

    if (error.message) {
      return error.message;
    }
  }

  return 'Please try again.';
}

export default function FriendsScreen() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [friends, setFriends] = useState<FriendsGroupedResponse>(emptyFriends);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const loadFriends = useCallback(
    async (showRefresh = false) => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setFriends(emptyFriends);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (showRefresh) {
        setIsRefreshing(true);
      } else if (!hasLoadedOnce.current) {
        setIsLoading(true);
      }

      try {
        const token = await getTokenRef.current();
        const response = await getFriends(token);
        setFriends(response);
        hasLoadedOnce.current = true;
      } catch (error) {
        console.error('Failed to load friends', error);
        Alert.alert('Unable to load friends', getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isLoaded, isSignedIn],
  );

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [loadFriends]),
  );

  if (!isLoaded || isLoading) {
    return (
      <Container>
        <Header variant="default" title="Friends" showBottomDivider={false} />
        <LoadingState>
          <ActivityIndicator color="white" />
          <LoadingText role="text">Loading...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  const handleAddFriend = () => router.push('/addfriend');

  const handleRemoveFriend = async (friend: FriendListItem) => {
    try {
      setRemovingFriendId(friend.id);
      const token = await getTokenRef.current();
      await toggleFriendship(token, friend.id);
      setFriends(previous => ({
        onSameEvent: previous.onSameEvent.filter(item => item.id !== friend.id),
        otherFriends: previous.otherFriends.filter(item => item.id !== friend.id),
      }));
    } catch (error) {
      console.error('Failed to remove friend', error);
      Alert.alert('Unable to remove friend', getErrorMessage(error));
    } finally {
      setRemovingFriendId(null);
    }
  };

  const renderFriend = (friend: FriendListItem, action: 'event' | 'remove') => (
    <TouchableOpacity
      key={friend.id}
      onPress={() => router.push(`/friends/${friend.id}`)}
      accessible={true}
      role="button"
      accessibilityLabel={`${friend.name}, username ${friend.username}. Tap to view profile.`}
    >
      <FriendRow>
        <Avatar
          source={getAvatarSource(friend)}
          role="image"
          accessibilityLabel={`Profile picture of ${friend.name}`}
        />
        <Info>
          <Name>{friend.name}</Name>
          <Username>@{friend.username}</Username>
        </Info>
        <Buttons>
          {action === 'event' ? (
            <>
              <PingFriend
                onPress={() => console.log('Buzz amigo')}
                role="button"
                accessibilityLabel={`Buzz ${friend.name}`}
                accessibilityHint={`Send a buzz to ${friend.name}`}
              />
              <FindFriendButton
                onPress={() => router.push({ pathname: '/map', params: { focusId: friend.id } })}
                role="button"
                accessibilityLabel={`Locate ${friend.name} on the map`}
                accessibilityHint="Shows the location of the friend on the map"
              />
            </>
          ) : (
            <FriendActionButton
              variant="remove"
              onPress={() => handleRemoveFriend(friend)}
              disabled={removingFriendId === friend.id}
              role="button"
              accessibilityLabel={`Remove ${friend.name}`}
              accessibilityHint="Remove this friend from your list"
            />
          )}
        </Buttons>
      </FriendRow>
    </TouchableOpacity>
  );

  return (
    <Container>
      <Head>
        <title>Friends | Safinity</title>
      </Head>

      <Header variant="default" title="Friends" showBottomDivider={false} />

      <ScrollArea
        importantForAccessibility="yes"
        accessibilityLabel="Lista de amigos"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadFriends(true)}
            tintColor="white"
          />
        }
      >
        {/* Region: Friends Header */}
        <RegionContainer role="region" accessibilityLabel="Cabeçalho de amigos">
          <SectionTitle role="header" accessibilityLevel={1}>
            <Title>Friends</Title>
            <TouchableOpacity
              onPress={handleAddFriend}
              accessible={true}
              role="button"
              accessibilityLabel="Add a new friend"
              accessibilityHint="Go to the add friend screen"
            >
              <Ionicons name="person-add-outline" size={24} color="white" />
            </TouchableOpacity>
          </SectionTitle>
        </RegionContainer>

        {/* Region: On the same event */}
        <RegionContainer role="region" accessibilityLabel="Amigos no mesmo evento">
          <SectionSubtitle role="header" accessibilityLevel={2}>
            On the same event
          </SectionSubtitle>
          {friends.onSameEvent.length ? (
            friends.onSameEvent.map(friend => renderFriend(friend, 'event'))
          ) : (
            <EmptyText>No friends on the same event.</EmptyText>
          )}
        </RegionContainer>

        {/* Region: Other Friends */}

        <RegionContainer role="region" accessibilityLabel="Other friends">
          <SectionSubtitle role="header" accessibilityLevel={2}>
            Other Friends
          </SectionSubtitle>
          {friends.otherFriends.length ? (
            friends.otherFriends.map(friend => renderFriend(friend, 'remove'))
          ) : (
            <EmptyText>No other friends yet.</EmptyText>
          )}
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
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  text-align: center;
  font-size: ${({ theme }) => theme.fonts.sizes.base}px;
  color: ${({ theme }) => theme.colors.white};
`;

const LoadingState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
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
