import React, { useMemo } from 'react';
import { Dimensions, FlatList, ScrollView, Platform } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

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
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Navegação Superior */}
        <HeaderNav theme={theme}>
          <BackButton onPress={() => router.push('/friends')}>
            <Ionicons name="arrow-back" size={theme.width.iconHeader} color={theme.colors.white} />
          </BackButton>
          <UsernameText theme={theme}>@{friendData.username}</UsernameText>
        </HeaderNav>

        {/* Perfil */}
        <ProfileHeader theme={theme}>
          <AvatarImage theme={theme} source={userImages[friendData.image]} />
          <InfoSection theme={theme}>
            <DisplayName theme={theme}>{friendData.name}</DisplayName>
            <StatsText theme={theme}>Been in {friendData.pastEvents?.length || 0} events</StatsText>
          </InfoSection>
          <FriendActionButton />
        </ProfileHeader>

        {/* Eventos */}
        <SectionTitle theme={theme}>{userPastEvents.length} Events in common</SectionTitle>

        <FlatList
          data={userPastEvents}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          snapToInterval={width * 0.75 + theme.spacing.margemLateral}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: theme.spacing.margemLateral }}
          renderItem={({ item }) => <EventCard event={item} />}
        />
      </ScrollView>
    </Container>
  );
}

/* ----------------------------- Styled Components ----------------------------- */

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const HeaderNav = styled.View<{ theme: any }>`
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

const UsernameText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.colors.palette.primary.light90};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  font-weight: 600;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

const ProfileHeader = styled.View<{ theme: any }>`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.margemLateral}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const AvatarImage = styled.Image<{ theme: any }>`
  width: ${({ theme }) => theme.height.friendProfileAvatar}px;
  height: ${({ theme }) => theme.height.friendProfileAvatar}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const InfoSection = styled.View<{ theme: any }>`
  margin-left: ${({ theme }) => theme.spacing.lg}px;
  flex: 1;
`;

const DisplayName = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h1.fontSize}px;
  font-weight: 600;
`;

const StatsText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.colors.palette.neutral.neutral40};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const SectionTitle = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.colors.palette.primary.light50};
  font-family: ${({ theme }) => theme.text.titulo.h3.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h3.fontSize}px;
  font-weight: 600;
  padding: 0 ${({ theme }) => theme.spacing.margemLateral}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;
