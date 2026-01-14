import React, { useMemo } from 'react';
import { Dimensions, FlatList, ScrollView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

// --- Imports de Dados e Assets ---
import users from '@/data/users.json';
import allEvents from '@/data/events.json';
import { userImages } from '../../../assets/images/Users/userImages';

import { theme } from '../../../constants/theme';
import { EventCard } from '@/components/EventCard';
import FriendActionButton from '@/components/FriendActionButton';

const { width } = Dimensions.get('window');

export default function FriendProfile() {
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
        <HeaderNav>
          <BackButton onPress={() => router.push('/friends')}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.white} />
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
          <FriendActionButton onPress={() => console.log('Remover amigo')} />
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
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={{ paddingRight: theme.spacing.margemLateral }}
        />
      </ScrollView>
    </Container>
  );
}

/* ----------------------------- Styled Components ----------------------------- */

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const HeaderNav = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Platform.OS === 'ios' ? '60px' : '40px'} ${theme.spacing.margemLateral}px 20px;
`;

const BackButton = styled.Pressable`
  padding: 8px;
`;

const UsernameText = styled.Text`
  color: ${theme.colors.palette.primary.light90};

  font-family: ${theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${theme.text.titulo.h.fontSize}px;
  font-weight: 600;
  margin-left: 8px;
`;

const ProfileHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 20px ${theme.spacing.margemLateral}px;
  margin-bottom: ${theme.spacing.xl}px;
`;

const AvatarImage = styled.Image`
  width: 110px;
  height: 110px;
  border-radius: ${theme.borderRadius.round}px;
  border-width: 2px;
  border-color: ${theme.colors.primary};
`;

const InfoSection = styled.View`
  margin-left: ${theme.spacing.lg}px;
  flex: 1;
`;

const DisplayName = styled.Text`
  color: ${theme.colors.white};
  font-family: ${theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${theme.text.titulo.h1.fontSize}px;
  font-weight: 600;
`;

const StatsText = styled.Text`
  color: ${theme.colors.palette.neutral.neutral40};
  font-family: ${theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${theme.text.corpo.corpoTexto.fontSize}px;
  margin-top: ${theme.spacing.xs}px;
`;

const SectionTitle = styled.Text`
  color: ${theme.colors.palette.primary.light50};
  font-family: ${theme.text.titulo.h3.fontFamily};
  font-size: ${theme.text.titulo.h3.fontSize}px;
  font-weight: 600;
  padding: 0 ${theme.spacing.margemLateral}px;
  margin-bottom: ${theme.spacing.md}px;
  margin-top: ${theme.spacing.sm}px;
`;
