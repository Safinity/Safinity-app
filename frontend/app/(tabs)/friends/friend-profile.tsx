import React, { useMemo } from 'react';
import { Dimensions, FlatList, Platform, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';

// --- Dados e Assets ---
import users from '@/data/users.json';
import allEvents from '@/data/events.json';
import { userImages } from '../../../assets/images/Users/userImages';
import { eventImages } from '../../../assets/images/Events';

const { width } = Dimensions.get('window');

// --- Styled Components ---

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
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.titulo.h};
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

const ProfileHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.margemLateral}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const AvatarImage = styled.Image`
  width: ${({ theme }) => theme.height.md}px;
  height: ${({ theme }) => theme.height.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const InfoSection = styled.View`
  margin-left: ${({ theme }) => theme.spacing.md}px;
  flex: 1;
`;

const DisplayName = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.titulo.h2};
`;

const StatsText = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  ${({ theme }) => theme.text.textoPequeno};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const ActionButton = styled.Pressable`
  width: ${({ theme }) => theme.height.tam_42}px;
  height: ${({ theme }) => theme.height.tam_42}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.palette.primary.light50};
  ${({ theme }) => theme.text.titulo.h3};
  padding: 0 ${({ theme }) => theme.spacing.margemLateral}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const EventCard = styled.View`
  width: ${width * 0.75}px;
  height: ${({ theme }) => theme.height.card.default}px;
  margin-left: ${({ theme }) => theme.spacing.margemLateral}px;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge}px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const EventImageOverlay = styled.ImageBackground`
  flex: 1;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

const GradientOverlay = styled.View`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.35);
`;

const EventDate = styled.Text`
  color: ${({ theme }) => theme.colors.neutralGray};
  ${({ theme }) => theme.text.label};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const EventTitle = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.text.titulo.h2};
`;

// --- Screen ---

export default function FriendProfileScreen() {
  const theme = useTheme();
  const { friendId } = useLocalSearchParams();

  const friendData = useMemo(
    () => users.find(u => u.id === friendId) || users.find(u => u.id === 'u6'),
    [friendId],
  );

  const userPastEvents = useMemo(() => {
    if (!friendData?.pastEvents) return [];
    return allEvents.filter(event => friendData.pastEvents.includes(event.id));
  }, [friendData]);

  if (!friendData) return null;

  return (
    <Container>
      <Head>
        <title> {friendData.name} profile | Safinity</title>
      </Head>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeaderNav>
          <BackButton onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={theme.width.iconHeader} color={theme.colors.white} />
          </BackButton>
          <UsernameText>@{friendData.username}</UsernameText>
        </HeaderNav>

        {/* Perfil */}
        <ProfileHeader>
          <AvatarImage source={userImages[friendData.image]} />

          <InfoSection>
            <DisplayName>{friendData.name}</DisplayName>
            <StatsText>Been in {friendData.pastEvents?.length || 0} events</StatsText>
          </InfoSection>

          <ActionButton>
            <Ionicons name="person-add" size={theme.width.iconHeader} color={theme.colors.white} />
          </ActionButton>
        </ProfileHeader>

        {/* Eventos */}
        <SectionTitle>{userPastEvents.length} Events in common</SectionTitle>

        <FlatList
          data={userPastEvents}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          snapToInterval={width * 0.75 + theme.spacing.margemLateral}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingRight: theme.spacing.margemLateral,
          }}
          renderItem={({ item }) => (
            <EventCard>
              <EventImageOverlay source={eventImages[item.image]}>
                <GradientOverlay />
                <EventDate>{item.date}</EventDate>
                <EventTitle>{item.title}</EventTitle>
              </EventImageOverlay>
            </EventCard>
          )}
        />
      </ScrollView>
    </Container>
  );
}
