import React, { useMemo } from 'react';
import { Dimensions, FlatList, ScrollView, Platform, AccessibilityInfo } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';

// --- Dados e Assets ---
import users from '@/data/users.json';
import allEvents from '@/data/events.json';
import { userImages } from '../../../assets/images/Users/userImages';

import { EventCard } from '@/components/EventCard';
import FriendActionButton from '@/components/FriendActionButton';

const { width } = Dimensions.get('window');

export default function FriendProfile() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();

  const friendData = useMemo(
    () => users.find(u => u.id === id) || users.find(u => u.id === 'u6'),
    [id],
  );

  const userPastEvents = useMemo(() => {
    const past = friendData?.pastEvents || [];
    return allEvents.events.filter(event => past.includes(event.id));
  }, [friendData]);

  if (!friendData) return null;

  return (
    <Container accessibilityLabel="Friend profile screen" role="summary">
      <Head>
        <title> {friendData.name} profile | Safinity</title>
      </Head>
      <ScrollView showsVerticalScrollIndicator={false} role="scrollview">
        {/* Navegação Superior */}
        <HeaderNav role="header" accessibilityLabel="Top navigation">
          <BackButton
            onPress={() => router.push('/friends')}
            role="button"
            accessibilityLabel="Go back to friends list"
          >
            <Ionicons name="arrow-back" size={theme.width.iconHeader} color={theme.colors.white} />
          </BackButton>

          <UsernameText
            role="header"
            accessibilityLabel={`Username ${friendData.username}`}
          >
            @{friendData.username}
          </UsernameText>
        </HeaderNav>

        {/* Perfil */}
        <ProfileHeader role="summary" accessibilityLabel="User profile information">
          <AvatarImage
            source={userImages[friendData.image]}
            role="image"
            accessibilityLabel={`Profile picture of ${friendData.name}`}
          />

          <InfoSection>
            <DisplayName role="header">{friendData.name}</DisplayName>

            <StatsText accessibilityLabel={`${friendData.pastEvents?.length || 0} events attended`}>
              Been in {friendData.pastEvents?.length || 0} events
            </StatsText>
          </InfoSection>

          <FriendActionButton />
        </ProfileHeader>

        {/* Eventos */}
        <SectionTitle role="header" accessibilityLabel="Events section">
          {userPastEvents.length} Events in common
        </SectionTitle>

        <FlatList
          role="list"
          accessibilityLabel="List of events in common"
          data={userPastEvents}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          snapToInterval={width * 0.75 + theme.spacing.margemLateral}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: theme.spacing.margemLateral }}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              role="button"
              accessibilityLabel={`Event ${item.title}`}
            />
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
