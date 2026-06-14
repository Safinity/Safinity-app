import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useAuth } from '@clerk/expo';

import { EventCard } from '@/components/EventCard';
import FriendActionButton from '@/components/FriendActionButton';
import { getFriendProfile, type FriendProfileResponse } from '@/utils/friends';
import { navigateToPreviousRoute } from '@/utils/navigationHistory';
import { userImages } from '../../../assets/images/Users/userImages';

const { width } = Dimensions.get('window');

function getAvatarSource(friend: FriendProfileResponse) {
  if (friend.image) {
    return { uri: `data:image/jpeg;base64,${friend.image}` };
  }

  return userImages.default;
}

export default function FriendProfile() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const friendId = Array.isArray(id) ? id[0] : id;
  const [friendData, setFriendData] = useState<FriendProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadFriendProfile() {
      if (!isLoaded || !friendId) return;

      if (!isSignedIn) {
        setError('Please sign in to view this profile.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const token = await getToken();
        const profile = await getFriendProfile(token, friendId);

        if (isActive) {
          setFriendData(profile);
        }
      } catch (profileError) {
        console.error('Failed to load friend profile', profileError);
        if (isActive) {
          setFriendData(null);
          setError('Friend profile not found.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadFriendProfile();

    return () => {
      isActive = false;
    };
  }, [friendId, getToken, isLoaded, isSignedIn]);

  if (isLoading || !isLoaded) {
    return (
      <Container accessibilityLabel="Friend profile screen" role="summary">
        <LoadingState>
          <ActivityIndicator color="white" />
          <LoadingText>Loading...</LoadingText>
        </LoadingState>
      </Container>
    );
  }

  if (error || !friendData) {
    return (
      <Container accessibilityLabel="Friend profile screen" role="summary">
        <HeaderNav role="header" accessibilityLabel="Top navigation">
          <BackButton
            onPress={() => navigateToPreviousRoute()}
            role="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={theme.width.iconHeader} color={theme.colors.white} />
          </BackButton>
        </HeaderNav>
        <EmptyState>{error || 'Friend profile not found.'}</EmptyState>
      </Container>
    );
  }

  return (
    <Container accessibilityLabel="Friend profile screen" role="summary">
      <Head>
        <title> {friendData.name} profile | Safinity</title>
      </Head>
      <ScrollView showsVerticalScrollIndicator={false} role="scrollview">
        {/* Navegação Superior */}
        <HeaderNav role="header" accessibilityLabel="Top navigation">
          <BackButton
            onPress={() => navigateToPreviousRoute()}
            role="button"
            accessibilityLabel="Go back to friends list"
          >
            <Ionicons name="arrow-back" size={theme.width.iconHeader} color={theme.colors.white} />
          </BackButton>

          <UsernameText role="header" accessibilityLabel={`Username ${friendData.username}`}>
            @{friendData.username}
          </UsernameText>
        </HeaderNav>

        {/* Perfil */}
        <ProfileHeader role="summary" accessibilityLabel="User profile information">
          <AvatarImage
            source={getAvatarSource(friendData)}
            role="image"
            accessibilityLabel={`Profile picture of ${friendData.name}`}
          />

          <InfoSection>
            <DisplayName role="header">{friendData.name}</DisplayName>

            <StatsText accessibilityLabel={`${friendData.totalEventsCount} events attended`}>
              Been in {friendData.totalEventsCount} events
            </StatsText>
          </InfoSection>

          <FriendActionButton />
        </ProfileHeader>

        {/* Eventos */}
        <SectionTitle role="header" accessibilityLabel="Events section">
          {friendData.commonEvents.length} Events in common
        </SectionTitle>

        <FlatList
          role="list"
          accessibilityLabel="List of events in common"
          data={friendData.commonEvents}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          snapToInterval={width * 0.75 + theme.spacing.margemLateral}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: theme.spacing.margemLateral }}
          renderItem={({ item }) => (
            <EventCard event={item} role="button" accessibilityLabel={`Event ${item.name}`} />
          )}
        />
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoadingState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const EmptyState = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

const HeaderNav = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) =>
      Platform.OS === 'ios'
        ? theme.spacing.margemTop + theme.spacing.lg
        : theme.spacing.margemTop}px
    ${({ theme }) => theme.spacing.margemLateral}px ${({ theme }) => theme.spacing.md}px;
`;

const BackButton = styled.Pressable`
  padding: ${({ theme }) => theme.spacing.sm}px;
`;

const UsernameText = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light90};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  font-weight: 600;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

const ProfileHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.margemLateral}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const AvatarImage = styled.Image`
  width: ${({ theme }) => theme.height.friendProfileAvatar}px;
  height: ${({ theme }) => theme.height.friendProfileAvatar}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const InfoSection = styled.View`
  margin-left: ${({ theme }) => theme.spacing.lg}px;
  flex: 1;
`;

const DisplayName = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize}px;
  font-weight: 600;
`;

const StatsText = styled.Text`
  color: ${({ theme }) => theme.colors.palette.neutral.neutral60};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light50};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  font-weight: 600;
  padding: 0 ${({ theme }) => theme.spacing.margemLateral}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;
