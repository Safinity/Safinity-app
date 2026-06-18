import React, { useEffect, useState } from 'react';
import { FlatList, StatusBar, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { HeroBanner } from '../../components/HeroBanner';
import { EventCard } from '../../components/EventCard';
import { CalendarCard } from '../../components/CalendarCard'; 

interface Event {
  id: string;
  name: string;
  status: 'active' | 'upcoming' | 'past' | 'planned' | 'finished';
  category: string;
  image?: string;
  venue_name?: string;
  [key: string]: any;
}

interface Activity {
  id: string;
  event_id: string;
  name: string;
  start_time: string;
  end_time: string;
  description?: string;
  point_interest_id: string;
  poi_name?: string; 
  specifications?: {
    image?: string;
    category?: string;
  };
  isFavorite?: boolean;
}

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [liveEvent, setLiveEvent] = useState<Event | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Music');

  const categories = ['Music', 'Tech', 'Cultural', 'Educational'];

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '00:00';
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      try {
        const eventsResponse = await api.get('/events');
        const allEvents = eventsResponse.data;
        setEvents(allEvents);
        
        const active = allEvents.find((e: Event) => e.status === 'active');
        
        if (active) {
          setLiveEvent(active);
          const activitiesResponse = await api.get(`/events/${active.id}/activities`);
          setActivities(activitiesResponse.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const handleLeaveEvent = () => {
    setLiveEvent(null);
  };

  if (loading) {
    return (
      <Container>
        <Header />
        <Content>
          <SectionTitle style={{ color: 'white', marginTop: 40 }}></SectionTitle>
        </Content>
      </Container>
    );
  }

  const upcomingEvents = events.filter(
    e =>
      ['upcoming', 'active', 'planned'].includes(e.status) &&
      e.category?.toLowerCase().includes(selectedCategory.toLowerCase()),
  );

  // =======================================================
  // CENÁRIO 1: UTILIZADOR DENTRO DE UM EVENTO ATIVO (MODO EVENTO)
  // =======================================================
  if (liveEvent) {
    return (
      <Container>
        <Head>
          <title>{liveEvent.name} | Safinity</title>
        </Head>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <Header />

        <Content>
          {/* O Banner gere autonomamente o texto "Now, at" a branco puro lá dentro */}
          <HeroBanner event={liveEvent} isLiveMode={true} />

          <PaddedContent>
            <WelcomeText>
              Time to just vibe and enjoy. If you need anything at all,{' '}
              <BoldText>we’re just a tap away.</BoldText>
            </WelcomeText>

            <LeaveButton onPress={handleLeaveEvent}>
              <Ionicons name="log-out-outline" size={20} color="#7A39B8" style={{ marginRight: 8 }} />
              <LeaveButtonText>Leave event</LeaveButtonText>
            </LeaveButton>

            <PopularActivitiesTitle>Popular activities</PopularActivitiesTitle>
          </PaddedContent>

          <VerticalListWrapper>
            {activities.length > 0 ? (
              activities.map((activity) => {
                const mappedItem = {
                  id: activity.id,
                  title: activity.name,
                  image: activity.specifications?.image || liveEvent.image,
                  location: activity.poi_name || liveEvent.venue_name || 'Recinto',
                  startTime: formatTime(activity.start_time),
                  endTime: formatTime(activity.end_time),
                  isFavorite: activity.isFavorite ?? false,
                };

                return (
                  <CalendarCard 
                    key={activity.id} 
                    item={mappedItem} 
                    onToggleFavorite={async (item: any, isFav: boolean) => {
                      if (isFav) {
                        await api.post('/favorites', { activity_id: item.id });
                      } else {
                        await api.delete(`/favorites/${item.id}`);
                      }
                    }}
                  />
                );
              })
            ) : (
              <NoActivitiesText>No activities scheduled for the next few hours.</NoActivitiesText>
            )}
          </VerticalListWrapper>
        </Content>
      </Container>
    );
  }

  // =======================================================
  // CENÁRIO 2: FEED GLOBAL (SEM EVENTO ATIVO ATUALMENTE)
  // =======================================================
  return (
    <Container>
      <Head>
        <title>Home | Safinity</title>
      </Head>
      <Stack.Screen options={{ title: 'Home | Safinity', headerShown: false }} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Header />

      <Content>
        <PaddedContent>
          <SearchWrapper>
            <SearchInput value={searchValue} onChangeText={setSearchValue} variant="homepage" />
          </SearchWrapper>
        </PaddedContent>

        <FilterTags
          tags={categories}
          selectedTags={[selectedCategory]}
          onTagPress={setSelectedCategory}
          variant="homepage"
        />

        <PaddedContent>
          <SectionHeader>
            <SectionTitle>{selectedCategory} events</SectionTitle>
            <Pressable onPress={() => router.push('/events-list')}>
              <SeeMore>See more</SeeMore>
            </Pressable>
          </SectionHeader>
        </PaddedContent>

        <FlatList
          horizontal
          data={upcomingEvents}
          renderItem={({ item }) => <EventCard event={item} />}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 40,
            paddingRight: 40,
            paddingBottom: 120,
          }}
          snapToInterval={280 + 16}
          decelerationRate="fast"
        />
      </Content>
    </Container>
  );
}

// =======================================================
// FOLHAS DE ESTILO ADAPTADAS AO THEME GLOBAL (FUNDO ORIGINAL ESCURO)
// =======================================================

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: any) => theme.colors.background};
`;

const Content = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
  bounces: false,
})`
  flex: 1;
`;

const PaddedContent = styled.View`
  padding: 0 ${({ theme }: any) => theme.spacing.margemLateral}px;
`;

const WelcomeText = styled.Text`
  color: ${({ theme }: any) => theme.colors.white || '#FFFFFF'}; 
  font-family: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.corpo.corpoTexto.lineHeight || 24}px;
  margin-top: ${({ theme }: any) => theme.spacing.md}px;
  margin-bottom: ${({ theme }: any) => theme.spacing.lg}px;
  opacity: 0.9;
`;

const BoldText = styled.Text`
  font-family: ${({ theme }: any) => theme.text.corpo.bold?.fontFamily || 'System'};
  font-weight: bold;
  color: ${({ theme }: any) => theme.colors.white || '#FFFFFF'};
`;

const LeaveButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }: any) => theme.colors.primary_10 || '#EFE5FA'}; 
  padding: 14px;
  border-radius: 20px;
  margin-bottom: ${({ theme }: any) => theme.spacing.xl}px;
`;

const LeaveButtonText = styled.Text`
  color: ${({ theme }: any) => theme.colors.primary || '#7A39B8'}; 
  font-family: ${({ theme }: any) => theme.text.corpo.medium?.fontFamily || 'System'};
  font-size: 16px;
  font-weight: 600;
`;

const PopularActivitiesTitle = styled.Text`
  color: ${({ theme }: any) => theme.colors.primary_50 || '#A259FF'}; 
  font-family: ${({ theme }: any) => theme.text.titulo.h.fontFamily};
  font-size: 18px;
  font-weight: bold;
  margin-bottom: ${({ theme }: any) => theme.spacing.md}px;
`;

const VerticalListWrapper = styled.View`
  padding: 0 ${({ theme }: any) => theme.spacing.margemLateral}px;
  padding-bottom: 120px; 
`;

const NoActivitiesText = styled.Text`
  color: ${({ theme }: any) => theme.colors.textMuted || '#888888'};
  font-family: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }: any) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }: any) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }: any) => theme.colors.white};
  font-family: ${({ theme }: any) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }: any) => theme.text.titulo.h.fontSize}px;
`;

const SeeMore = styled.Text`
  font-family: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.corpo.corpoTexto.lineHeight}px;
  color: ${({ theme }: any) => theme.colors.primary_50};
  padding: 5px;
`;

const SearchWrapper = styled.View`
  margin-top: ${({ theme }: any) => theme.spacing.lg}px;
`;