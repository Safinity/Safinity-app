import { useAuth } from '@clerk/expo';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ImageBackground, Pressable, StatusBar } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../utils/api';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { HeroBanner } from '../../components/HeroBanner';
import { EventCard } from '../../components/EventCard';
import { CalendarCard } from '../../components/CalendarCard';
import { eventImages } from '../../assets/images/Events';
import { useEventMode } from '../../context/EventModeContext';
import { getMyProfile } from '../../utils/profile';
import { getUserTickets, type UserTicket } from '../../utils/tickets';
import { getEventImageSource } from '../../utils/eventImages';

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

function formatEventDate(start?: string | null, end?: string | null) {
  if (!start || !end) return 'Date TBD';

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const month = startDate.toLocaleString('en-GB', { month: 'long' });
    const year = startDate.getFullYear();

    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.getDate()} - ${endDate.getDate()} ${month}, ${year}`;
    }

    return `${startDate.getDate()} ${startDate.toLocaleString('en-GB', {
      month: 'short',
    })} - ${endDate.getDate()} ${endDate.toLocaleString('en-GB', {
      month: 'short',
    })}, ${year}`;
  } catch {
    return 'Date TBD';
  }
}

function getLocalAwareEventImageSource(image?: string | null) {
  if (image && eventImages[image]) {
    return eventImages[image];
  }

  return getEventImageSource(image, eventImages['banner-lista-eventos']);
}

export default function HomeScreen() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { activeEvent, dismissedEventId, enterEventMode, leaveEventMode } = useEventMode();
  const theme = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [displayName, setDisplayName] = useState('there');
  const [loading, setLoading] = useState(true);
  const getTokenRef = useRef(getToken);

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

  getTokenRef.current = getToken;

  const liveEvent = activeEvent;

  useEffect(() => {
    async function loadInitialData() {
      if (!isLoaded) {
        return;
      }

      try {
        const token = isSignedIn ? await getTokenRef.current() : null;
        const [eventsResponse, profileResponse, ticketsResponse, presentEventResponse] =
          await Promise.all([
            api.get('/events'),
            isSignedIn ? getMyProfile(token).catch(() => null) : Promise.resolve(null),
            isSignedIn ? getUserTickets(token).catch(() => []) : Promise.resolve([]),
            isSignedIn
              ? api
                  .get('/events/present-event', {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                  })
                  .catch(() => ({ data: null }))
              : Promise.resolve({ data: null }),
          ]);
        const allEvents = Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data?.results || [];
        setEvents(allEvents);

        if (profileResponse) {
          setDisplayName(
            profileResponse.name || profileResponse.username || profileResponse.email || 'there',
          );
        }

        setTickets(ticketsResponse);

        const active = presentEventResponse.data;

        if (active && !liveEvent && dismissedEventId !== String(active.id)) {
          enterEventMode(active);
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
  }, [dismissedEventId, enterEventMode, isLoaded, isSignedIn, liveEvent]);

  useEffect(() => {
    async function loadActiveEventActivities() {
      if (!liveEvent?.id) {
        setActivities([]);
        return;
      }

      try {
        const activitiesResponse = await api.get(`/events/${liveEvent.id}/activities`);
        setActivities(Array.isArray(activitiesResponse.data) ? activitiesResponse.data : []);
      } catch (error) {
        console.error('Erro ao carregar atividades do evento ativo:', error);
        setActivities([]);
      }
    }

    loadActiveEventActivities();
  }, [liveEvent?.id]);

  const handleLeaveEvent = () => {
    leaveEventMode();
  };

  const handleOpenTicketEvent = (ticket: UserTicket) => {
    if (!ticket.event) return;

    enterEventMode({
      ...ticket.event,
      id: ticket.event_id,
      status: ticket.event.status || 'active',
    });
    router.replace('/(tabs)');
  };

  const ticketEvents = useMemo(
    () => tickets.filter(ticket => ticket.event).slice(0, 8),
    [tickets],
  );

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

  if (liveEvent) {
    return (
      <Container>
        <Head>
          <title>{liveEvent.name} | Safinity</title>
        </Head>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <Header variant="default" forceDarkLogo={true} />

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
          <GreetingBlock>
            <GreetingLabel>Welcome back,</GreetingLabel>
            <GreetingName>{displayName}!</GreetingName>
          </GreetingBlock>

          <OutsideSectionTitle>Explore your next events</OutsideSectionTitle>
        </PaddedContent>

        <FlatList
          horizontal
          data={ticketEvents}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: theme.spacing.margemLateral,
            paddingRight: theme.spacing.margemLateral,
            paddingBottom: theme.spacing.lg,
          }}
          ListEmptyComponent={
            <EmptyTicketCard>
              <Ionicons
                name="ticket-outline"
                size={theme.width.iconHeader}
                color={theme.colors.primary}
              />
              <EmptyTicketText>Your wallet tickets will appear here.</EmptyTicketText>
            </EmptyTicketCard>
          }
          renderItem={({ item }) => {
            const event = item.event;

            return (
              <TicketPreviewCard
                onPress={() => handleOpenTicketEvent(item)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${event?.name || 'event'} event mode`}
              >
                <TicketBackground source={getLocalAwareEventImageSource(event?.image)}>
                  <TicketOverlay>
                    <TicketTopRow>
                      <Ionicons name="heart" size={theme.height.xs} color={theme.colors.white} />
                      <TicketBarcode>
                        {Array.from({ length: 11 }).map((_, index) => (
                          <TicketBar key={`${item.id}-${index}`} $index={index} />
                        ))}
                      </TicketBarcode>
                    </TicketTopRow>

                    <TicketFooter>
                      <TicketDate>{formatEventDate(event?.start_date, event?.end_date)}</TicketDate>
                      <TicketTitle numberOfLines={2}>{event?.name || 'Untitled event'}</TicketTitle>
                    </TicketFooter>
                  </TicketOverlay>
                </TicketBackground>
              </TicketPreviewCard>
            );
          }}
        />

        <PaddedContent>
          <SearchIntroTitle>Search for your next event?</SearchIntroTitle>
          <SearchIntroText>
            Shall we <BoldDarkText>explore</BoldDarkText> what lies ahead? Let us do it!
          </SearchIntroText>
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

const GreetingBlock = styled.View`
  margin-top: ${({ theme }: any) => theme.spacing.xxl}px;
  margin-bottom: ${({ theme }: any) => theme.spacing.xl}px;
`;

const GreetingLabel = styled.Text`
  color: ${({ theme }: any) => theme.colors.white};
  font-family: ${({ theme }: any) => theme.text.titulo.h2.fontFamily};
  font-size: ${({ theme }: any) => theme.text.titulo.h2.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.titulo.h2.lineHeight}px;
`;

const GreetingName = styled.Text`
  color: ${({ theme }: any) => theme.colors.primary};
  font-family: ${({ theme }: any) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }: any) => theme.text.titulo.h.fontSize}px;
  margin-top: ${({ theme }: any) => theme.spacing.xs}px;
`;

const OutsideSectionTitle = styled.Text`
  color: ${({ theme }: any) => theme.colors.white};
  font-family: ${({ theme }: any) => theme.text.titulo.h2.fontFamily};
  font-size: ${({ theme }: any) => theme.text.titulo.h2.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.titulo.h2.lineHeight}px;
  margin-bottom: ${({ theme }: any) => theme.spacing.md}px;
`;

const TicketPreviewCard = styled.Pressable`
  width: ${({ theme }: any) => theme.height.xl}px;
  height: ${({ theme }: any) => theme.height.card.compact}px;
  margin-right: ${({ theme }: any) => theme.spacing.md}px;
  border-radius: ${({ theme }: any) => theme.borderRadius.large}px;
  overflow: hidden;
`;

const TicketBackground = styled(ImageBackground).attrs({
  resizeMode: 'cover',
})`
  flex: 1;
`;

const TicketOverlay = styled(LinearGradient).attrs({
  colors: ['rgba(0,0,0,0.08)', 'rgba(146,66,204,0.48)', 'rgba(0,0,0,0.82)'],
  locations: [0, 0.5, 1],
})`
  flex: 1;
  padding: ${({ theme }: any) => theme.spacing.lg}px;
  justify-content: space-between;
`;

const TicketTopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const TicketBarcode = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: ${({ theme }: any) => theme.spacing.xxs}px;
  height: ${({ theme }: any) => theme.height.sm}px;
`;

const TicketBar = styled.View<{ $index: number }>`
  width: ${({ theme }: any) => theme.spacing.xs}px;
  height: ${({ $index, theme }: any) =>
    $index % 3 === 0 ? theme.height.sm : $index % 2 === 0 ? theme.height.tam_42 : theme.height.xs}px;
  background-color: ${({ theme }: any) => theme.colors.white};
  opacity: ${({ $index }: any) => ($index % 2 === 0 ? 0.95 : 0.75)};
`;

const TicketFooter = styled.View``;

const TicketDate = styled.Text`
  color: ${({ theme }: any) => theme.colors.white};
  font-family: ${({ theme }: any) => theme.text.textoPequeno.fontFamily};
  font-size: ${({ theme }: any) => theme.text.textoPequeno.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.textoPequeno.lineHeight}px;
  margin-bottom: ${({ theme }: any) => theme.spacing.xs}px;
`;

const TicketTitle = styled.Text`
  color: ${({ theme }: any) => theme.colors.white};
  font-family: ${({ theme }: any) => theme.text.titulo.h2.fontFamily};
  font-size: ${({ theme }: any) => theme.text.titulo.h2.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.titulo.h2.lineHeight}px;
`;

const EmptyTicketCard = styled.View`
  width: ${({ theme }: any) => theme.height.xl}px;
  height: ${({ theme }: any) => theme.height.card.compact}px;
  margin-right: ${({ theme }: any) => theme.spacing.md}px;
  border-radius: ${({ theme }: any) => theme.borderRadius.large}px;
  background-color: ${({ theme }: any) => theme.colors.grayNavbar};
  align-items: center;
  justify-content: center;
  padding: ${({ theme }: any) => theme.spacing.lg}px;
`;

const EmptyTicketText = styled.Text`
  color: ${({ theme }: any) => theme.colors.primary};
  font-family: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.corpo.corpoTexto.lineHeight}px;
  text-align: center;
  margin-top: ${({ theme }: any) => theme.spacing.sm}px;
`;

const SearchIntroTitle = styled.Text`
  color: ${({ theme }: any) => theme.colors.white};
  font-family: ${({ theme }: any) => theme.text.titulo.h2.fontFamily};
  font-size: ${({ theme }: any) => theme.text.titulo.h2.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.titulo.h2.lineHeight}px;
  margin-top: ${({ theme }: any) => theme.spacing.sm}px;
`;

const SearchIntroText = styled.Text`
  color: ${({ theme }: any) => theme.colors.white};
  font-family: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }: any) => theme.text.corpo.corpoTexto.fontSize}px;
  line-height: ${({ theme }: any) => theme.text.corpo.corpoTexto.lineHeight}px;
  margin-top: ${({ theme }: any) => theme.spacing.md}px;
`;

const BoldDarkText = styled.Text`
  color: ${({ theme }: any) => theme.colors.white};
  font-family: ${({ theme }: any) => theme.text.titulo.h3.fontFamily};
`;
