import { useAuth } from '@clerk/expo';
import React, { useEffect, useRef, useState } from 'react';
import { View, StatusBar, Platform, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Head from 'expo-router/head';

import Header from '../../components/ui/header';
import SearchInput from '../../components/ui/SearchInput';
import FilterTags from '../../components/ui/FilterTags';
import { CalendarCard } from '../../components/CalendarCard';
import api from '../../utils/api'; 
import { useActivityFavourites } from '../../context/ActivityFavouritesContext';
import { useEventMode } from '../../context/EventModeContext';

// --- Imports estáticos de imagens para o mapeamento local ---
import img1 from '../../assets/images/Calendar/1.jpg';
import img2 from '../../assets/images/Calendar/2.jpg';
import img3 from '../../assets/images/Calendar/3.jpg';
import img4 from '../../assets/images/Calendar/4.jpg';
import img5 from '../../assets/images/Calendar/5.jpg';
import img6 from '../../assets/images/Calendar/6.jpg';
import img7 from '../../assets/images/Calendar/7.jpg';
import img8 from '../../assets/images/Calendar/8.jpg';
import img9 from '../../assets/images/Calendar/9.jpg';
import img14 from '../../assets/images/Calendar/14.jpg';

const localImages: { [key: string]: any } = {
  '1.jpg': img1,
  '2.jpg': img2,
  '3.jpg': img3,
  '4.jpg': img4,
  '5.jpg': img5,
  '6.jpg': img6,
  '7.jpg': img7,
  '8.jpg': img8,
  '9.jpg': img9,
  '14.jpg': img14,
};

function formatActivityDate(value?: string | null) {
  if (!value) return 'Date TBD';

  try {
    return new Date(value).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return 'Invalid date';
  }
}

function formatActivityTime(value?: string | null) {
  if (!value) return '--:--';

  try {
    return new Date(value).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

function normalizeActivity(activity: any) {
  const specifications = activity.specifications || {};

  return {
    ...activity,
    title: activity.title || activity.name || 'Untitled activity',
    category: activity.category || specifications.category || 'Stages',
    image: activity.image || specifications.image || '1.jpg',
    location: activity.location || activity.points_interest?.name || 'Location TBD',
    date: activity.date || formatActivityDate(activity.start_time),
    startTime: activity.startTime || formatActivityTime(activity.start_time),
    endTime: activity.endTime || formatActivityTime(activity.end_time),
  };
}

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function getEventsList(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getRouteParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

// --- Styled Components ---
const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ScrollContent = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.margemLateral}px;
  padding-bottom: ${({ theme }) => theme.spacing.xxl}px;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
`;

const DateHeader = styled.Text`
  color: ${({ theme }) => theme.colors.inactive};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.textoPequeno.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  text-transform: capitalize;
`;

const MyCalendarButton = styled.TouchableOpacity`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xxl}px;
  align-self: center;
  background-color: ${({ theme }) => theme.colors.primary};
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  elevation: 5;
  z-index: 10;
`;

// CORREÇÃO: Alterado de theme.colors.white para a cor estática branca #FFFFFF
const ButtonText = styled.Text`
  color: #FFFFFF; 
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  line-height: 20px;
`;

const HeaderWrapper = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 20;
`;

const SpaceBottom = styled.View`
  height: 90px;
`;

export default function CalendarScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const requestedEventId = getRouteParam(eventId);
  const { activeEvent } = useEventMode();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [presentEvent, setPresentEvent] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    favouriteActivityIds,
    updatingActivityIds,
    setSelectedCalendarEventId,
    loadEventFavourites,
    toggleFavouriteActivity,
  } = useActivityFavourites();

  const categories = ['All', 'Stages', 'Workshops', 'Podcasts', 'Business'];

  getTokenRef.current = getToken;

  useEffect(() => {
    let isActive = true;

    const loadActivities = async () => {
      if (!isLoaded) {
        return;
      }

      try {
        const token = isSignedIn ? await getTokenRef.current() : null;
        let event = null;

        if (requestedEventId) {
          try {
            const eventResponse = await api.get(`/events/${requestedEventId}`);
            event = eventResponse.data;
          } catch (requestedEventError) {
            console.error('Erro ao buscar evento selecionado:', requestedEventError);
          }
        }

        if (!event && activeEvent?.id) {
          event = activeEvent;
        }

        if (!event && isSignedIn) {
          try {
            const eventResponse = await api.get('/events/present-event', {
              headers: authHeaders(token),
            });
            event = eventResponse.data;
          } catch (presentEventError) {
            console.error('Erro ao buscar evento atual:', presentEventError);
          }
        }

        if (!event) {
          const eventsResponse = await api.get('/events', {
            params: { pageSize: 100, sortBy: 'start_date', sortOrder: 'asc' },
          });
          const eventsList = getEventsList(eventsResponse.data);
          event = eventsList[0] ?? null;
        }

        if (!isActive) {
          return;
        }

        setPresentEvent(event);
        setSelectedCalendarEventId(event?.id ? String(event.id) : null);
        setSelectedCategory('All');

        if (event?.id) {
          const [activitiesResponse] = await Promise.all([
            api.get(`/events/${event.id}/activities`),
            loadEventFavourites(event.id, true).catch(() => []),
          ]);
          const data = getEventsList(activitiesResponse.data);

          if (!isActive) return;
          setActivities(data.map(normalizeActivity));
        }
      } catch (error) {
        console.error('Erro ao buscar evento e atividades:', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadActivities();

    return () => {
      isActive = false;
    };
  }, [
    activeEvent,
    isLoaded,
    isSignedIn,
    loadEventFavourites,
    requestedEventId,
    setSelectedCalendarEventId,
  ]);

  const handleToggleFavorite = (activity: any, shouldBeFavorite: boolean) =>
    toggleFavouriteActivity(activity, presentEvent?.id, shouldBeFavorite);

  const filteredActivities = activities.filter(activity => {
    const search = searchValue.trim().toLowerCase();
    const matchesCategory = selectedCategory === 'All' || activity.category === selectedCategory;
    const matchesSearch = !search || activity.title?.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });
  const emptyMessage =
    activities.length === 0
      ? 'No activities found for this event'
      : 'No activities match this filter';

  return (
    <Container>
      <Head>
        <title>Activities | Safinity</title>
      </Head>

      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <HeaderWrapper
        style={{ paddingTop: Platform.OS === 'web' ? 15 : insets.top }}
        accessibilityRole="header"
      >
        <Header />
      </HeaderWrapper>

      <ScrollContent contentContainerStyle={{ paddingTop: theme.spacing.sm }}>

        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          variant="homepage"
          placeholder="Find your next activity"
        />

        <View style={{ marginHorizontal: -theme.spacing.margemLateral }} accessible>
          <FilterTags
            tags={categories}
            selectedTags={[selectedCategory]}
            onTagPress={setSelectedCategory}
            variant="homepage"
          />
        </View>

        {!loading && filteredActivities.length > 0
          ? filteredActivities.map((item, index) => {
              let resolvedImage;

              if (
                item.image &&
                (item.image.startsWith('http://') || item.image.startsWith('https://'))
              ) {
                resolvedImage = { uri: item.image };
              } else if (localImages[item.image]) {
                resolvedImage = localImages[item.image];
              } else {
                resolvedImage = img1; 
              }

              const activityId = String(item.id);
              const activityWithImage = {
                ...item,
                image: resolvedImage,
                isFavorite: favouriteActivityIds.has(activityId),
              };

              return (
                <View key={item.id}>
                  {(index === 0 || filteredActivities[index - 1].date !== item.date) && (
                    <DateHeader>{item.date}</DateHeader>
                  )}

                  <View style={{ marginBottom: theme.spacing.md }}>
                    <CalendarCard
                      item={activityWithImage}
                      onToggleFavorite={handleToggleFavorite}
                      isFavoriteUpdating={updatingActivityIds.has(activityId)}
                    />
                  </View>
                </View>
              );
            })
          : !loading && (
              <DateHeader style={{ textAlign: 'center', marginTop: 50 }}>{emptyMessage}</DateHeader>
            )}

        <SpaceBottom />
      </ScrollContent>

      <MyCalendarButton activeOpacity={0.8} onPress={() => router.push('/(tabs)/my-calendar')}>
        <ButtonText>My favourite activities</ButtonText>
      </MyCalendarButton>
    </Container>
  );
}