import React, { useMemo } from 'react';
import { Dimensions, FlatList, Platform, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

// --- Imports de Dados e Assets ---
import users from '@/data/users.json';
import allEvents from '@/data/events.json';
import { userImages } from '../../../assets/images/Users/userImages';
import { eventImages } from '../../../assets/images/Events';
import { Colors, Spacing } from '../../../constants/theme';

const { width } = Dimensions.get('window');

// --- Styled Components ---
const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
`;

const HeaderNav = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Platform.OS === 'ios' ? '60px' : '40px'} ${Spacing.margemLateral}px 20px;
`;

const BackButton = styled.Pressable`
  padding: 8px;
`;

const UsernameText = styled.Text`
  color: ${Colors.white};
  font-size: 24px;
  font-weight: bold;
  margin-left: 8px;
`;

const ProfileHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 0 ${Spacing.margemLateral}px;
  margin-bottom: 30px;
`;

const AvatarImage = styled.Image`
  width: 110px;
  height: 110px;
  border-radius: 55px;
  border-width: 2px;
  border-color: ${Colors.primary};
`;

const InfoSection = styled.View`
  margin-left: 20px;
  flex: 1;
`;

const DisplayName = styled.Text`
  color: ${Colors.white};
  font-size: 20px;
  font-weight: 600;
`;

const StatsText = styled.Text`
  color: #a1a1a1;
  font-size: 14px;
  margin-top: 4px;
`;

const ActionButton = styled.Pressable`
  background-color: #7b49f2;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  justify-content: center;
  align-items: center;
`;

const SectionTitle = styled.Text`
  color: #a78bfa;
  font-size: 18px;
  font-weight: 600;
  padding: 0 ${Spacing.margemLateral}px;
  margin-bottom: 20px;
  margin-top: 10px;
`;

const EventCard = styled.View`
  width: ${width * 0.75}px;
  height: 280px;
  margin-left: ${Spacing.margemLateral}px;
  border-radius: 30px;
  overflow: hidden;
  margin-bottom: 40px;
`;

const EventImageOverlay = styled.ImageBackground`
  flex: 1;
  justify-content: flex-end;
  padding: 20px;
`;

const GradientOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.35);
`;

const EventDate = styled.Text`
  color: #ddd;
  font-size: 12px;
  margin-bottom: 4px;
`;

const EventTitle = styled.Text`
  color: ${Colors.white};
  font-size: 22px;
  font-weight: bold;
`;

// --- Componente Principal ---
export default function FriendProfileScreen() {
  const { friendId } = useLocalSearchParams();

  // 1. Encontrar o amigo no JSON (Fallback para a Carlota u6 se não houver ID)
  const friendData = useMemo(
    () => users.find(u => u.id === friendId) || users.find(u => u.id === 'u6'),
    [friendId],
  );

  // 2. Filtrar eventos do JSON de eventos com base no array 'pastEvents' do utilizador
  const userPastEvents = useMemo(() => {
    if (!friendData || !friendData.pastEvents) return [];

    // Retorna apenas os eventos que estão na lista do amigo
    return allEvents.filter(event => friendData.pastEvents.includes(event.id));
  }, [friendData]);

  if (!friendData) return null;

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Navegação Superior */}
        <HeaderNav>
          <BackButton onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={Colors.white} />
          </BackButton>
          <UsernameText>@{friendData.username}</UsernameText>
        </HeaderNav>

        {/* Informação do Perfil */}
        <ProfileHeader>
          <AvatarImage source={userImages[friendData.image]} />

          <InfoSection>
            <DisplayName>{friendData.name}</DisplayName>
            <StatsText>Been in {friendData.pastEvents?.length || 0} events</StatsText>
          </InfoSection>

          <ActionButton onPress={() => console.log('Adicionar amigo')}>
            <Ionicons name="person-add" size={24} color="white" />
          </ActionButton>
        </ProfileHeader>

        {/* Lista de Eventos Dinâmica */}
        <SectionTitle>{userPastEvents.length} Events in common</SectionTitle>

        <FlatList
          data={userPastEvents}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          snapToInterval={width * 0.75 + Spacing.margemLateral}
          decelerationRate="fast"
          renderItem={({ item }) => (
            <EventCard>
              <EventImageOverlay source={eventImages[item.image]}>
                <GradientOverlay />
                <EventDate>{item.date}</EventDate>
                <EventTitle>{item.title}</EventTitle>
              </EventImageOverlay>
            </EventCard>
          )}
          contentContainerStyle={{ paddingRight: Spacing.margemLateral }}
        />
      </ScrollView>
    </Container>
  );
}
